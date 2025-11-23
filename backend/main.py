import os
import json
import asyncio
from datetime import datetime, UTC
from typing import Optional, Dict

import boto3
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from botocore.exceptions import ClientError

load_dotenv()

STORAGE_FILE = "instances_data.json"

AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_LAUNCH_TEMPLATE_ID = os.getenv("AWS_LAUNCH_TEMPLATE_ID","lt-0ca5736c0c7a26c51")

ec2_client = boto3.client(
    'ec2',
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
)

ssm_client = boto3.client(
    'ssm',
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
)

def load_instances() -> Dict[str, dict]:
    """Load instances from JSON file"""
    if os.path.exists(STORAGE_FILE):
        with open(STORAGE_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_instances(instances: Dict[str, dict]):
    """Save instances to JSON file"""
    with open(STORAGE_FILE, 'w') as f:
        json.dump(instances, f, indent=2)

def get_instance(instance_id: str) -> Optional[dict]:
    """Get instance data"""
    instances = load_instances()
    return instances.get(instance_id)

def update_instance(instance_id: str, data: dict):
    """Update instance data"""
    instances = load_instances()
    if instance_id in instances:
        instances[instance_id].update(data)
    else:
        instances[instance_id] = data
    save_instances(instances)

def delete_instance(instance_id: str):
    """Delete instance data"""
    instances = load_instances()
    if instance_id in instances:
        del instances[instance_id]
        save_instances(instances)

class CreateInstanceRequest(BaseModel):
    blob_id: str

app = FastAPI(
    title="AWS EC2 + Walrus Manager",
    description="Manage EC2 instances and fetch Walrus blobs",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def create_ec2_instance() -> Optional[dict]:
    """Create EC2 instance from Launch Template"""
    try:
        instance_name = f"walrus-vm-{datetime.now(UTC).strftime('%Y%m%d-%H%M%S')}"
        
        launch_params = {
            'LaunchTemplate': {'LaunchTemplateId': AWS_LAUNCH_TEMPLATE_ID},
            'MinCount': 1,
            'MaxCount': 1,
            'TagSpecifications': [
                {
                    'ResourceType': 'instance',
                    'Tags': [
                        {'Key': 'Name', 'Value': instance_name},
                        {'Key': 'ManagedBy', 'Value': 'WalrusAPI'}
                    ]
                }
            ]
        }
        
        response = ec2_client.run_instances(**launch_params)
        instance = response['Instances'][0]
        instance_id = instance['InstanceId']
        
        print(f"✅ EC2 instance created: {instance_id}")
        return {
            'instance_id': instance_id,
            'state': instance['State']['Name']
        }
        
    except ClientError as e:
        print(f"❌ AWS Error: {e}")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

async def wait_for_instance_running(instance_id: str, timeout: int = 300) -> Optional[str]:
    """Wait for instance to be running and return public IP"""
    wait_time = 0
    
    while wait_time < timeout:
        try:
            response = ec2_client.describe_instances(InstanceIds=[instance_id])
            instance = response['Reservations'][0]['Instances'][0]
            state = instance['State']['Name']
            
            if state == 'running':
                public_ip = instance.get('PublicIpAddress')
                if public_ip:
                    print(f"✅ Instance {instance_id} running at {public_ip}")
                    return public_ip
            elif state in ['terminated', 'terminating', 'stopped', 'stopping']:
                print(f"❌ Instance in {state} state")
                return None
            
            await asyncio.sleep(10)
            wait_time += 10
            print(f"⏳ Waiting for instance... ({wait_time}s)")
            
        except Exception as e:
            print(f"Error checking status: {e}")
            await asyncio.sleep(10)
            wait_time += 10
    
    print(f"❌ Timeout after {timeout}s")
    return None

async def wait_for_ssm(instance_id: str, timeout: int = 300) -> bool:
    """Wait for SSM agent to be ready"""
    wait_time = 0
    
    while wait_time < timeout:
        try:
            response = ssm_client.describe_instance_information(
                Filters=[{'Key': 'InstanceIds', 'Values': [instance_id]}]
            )
            if response['InstanceInformationList']:
                print(f"✅ SSM agent ready on {instance_id}")
                return True
        except Exception as e:
            print(f"⏳ SSM not ready: {str(e)[:50]}...")
        
        await asyncio.sleep(15)
        wait_time += 15
    
    print(f"❌ SSM timeout after {timeout}s")
    return False

async def fetch_walrus_blob(instance_id: str, blob_id: str) -> bool:
    """Use SSM to fetch Walrus blob on instance"""
    try:
        print(f"📦 Fetching Walrus blob: {blob_id}")
        
        # Command to fetch and extract blob
        command = f'''
        cd /tmp && \
        curl -L "https://aggregator.walrus-testnet.walrus.space/v1/blobs/by-object-id/{blob_id}" -o model.zip && \
        apt install python3.12-venv -y && \
        unzip -o model.zip && \
        cd model && \
        chmod +x ./script.sh && \
        bash ./script.sh &
        '''

        
        response = ssm_client.send_command(
            InstanceIds=[instance_id],
            DocumentName='AWS-RunShellScript',
            Parameters={'commands': [command]},
            TimeoutSeconds=150
        )
        
        command_id = response['Command']['CommandId']
        
        # Wait a bit for command to register
        await asyncio.sleep(2)
        
        max_wait = 60
        wait_time = 0
        while wait_time < max_wait:
            try:
                result = ssm_client.get_command_invocation(
                    CommandId=command_id,
                    InstanceId=instance_id
                )
                status = result['Status']
                
                if status == 'Success':
                    print(f"✅ Blob fetched successfully")
                    print(f"Output: {result['StandardOutputContent'][:500]}")
                    return True
                elif status in ['Failed', 'Cancelled', 'TimedOut']:
                    print(f"❌ Fetch failed: {result.get('StandardErrorContent', 'Unknown error')}")
                    return False
                elif status in ['Pending', 'InProgress']:
                    print(f"⏳ Command status: {status}")
                
                await asyncio.sleep(5)
                wait_time += 5
                
            except ClientError as e:
                if e.response['Error']['Code'] == 'InvocationDoesNotExist':
                    print(f"⏳ Waiting for command to register... ({wait_time}s)")
                    await asyncio.sleep(3)
                    wait_time += 3
                else:
                    raise
        
        print(f"❌ Command timeout")
        return False
        
    except Exception as e:
        print(f"❌ SSM Error: {e}")
        return False

@app.get("/")
async def root():
    """Health check endpoint"""
    instances = load_instances()
    return {
        "status": "healthy",
        "service": "AWS EC2 + Walrus Manager",
        "total_instances": len(instances)
    }

@app.post("/api/instances", status_code=201)
async def create_instance(request: CreateInstanceRequest):
    """
    Create new EC2 instance and fetch Walrus blob
    
    - **blob_id**: Walrus blob ID to fetch
    
    Returns complete result after instance is ready
    """
    result = await create_ec2_instance()
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create EC2 instance")
    
    instance_id = result['instance_id']
    
    update_instance(instance_id, {
        "instance_id": instance_id,
        "blob_id": request.blob_id,
        "status": "waiting_for_instance",
        "public_ip": None,
        "created_at": datetime.now(UTC).isoformat(),
        "error": None
    })
    
    try:
        public_ip = await wait_for_instance_running(instance_id)
        if not public_ip:
            update_instance(instance_id, {"status": "failed", "error": "Instance failed to start"})
            raise HTTPException(status_code=500, detail="Instance failed to start")
        
        update_instance(instance_id, {"public_ip": public_ip, "status": "waiting_for_ssm"})
        
        ssm_ready = await wait_for_ssm(instance_id)
        if not ssm_ready:
            update_instance(instance_id, {"status": "failed", "error": "SSM agent not ready"})
            raise HTTPException(status_code=500, detail="SSM agent not ready")
        
        update_instance(instance_id, {"status": "fetching_blob"})
        
        success = await fetch_walrus_blob(instance_id, request.blob_id)
        # if not success:
        #     update_instance(instance_id, {"status": "failed", "error": "Blob fetch failed"})
        #     raise HTTPException(status_code=500, detail="Blob fetch failed")
        
        update_instance(instance_id, {"status": "ready"})
        print(f"✅ Instance {instance_id} is ready!")
        
        return {
            "instance_id": instance_id,
            "blob_id": request.blob_id,
            "public_ip": public_ip,
            "status": "ready",
            "message": "Instance created and blob fetched successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        update_instance(instance_id, {"status": "failed", "error": str(e)})
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.delete("/api/instances/{instance_id}")
async def delete_instance(instance_id: str):
    """
    Terminate EC2 instance
    
    - **instance_id**: EC2 instance ID to terminate
    """
    try:
        # Terminate instance on AWS
        ec2_client.terminate_instances(InstanceIds=[instance_id])
        print(f"✅ Instance {instance_id} terminated")
        
        delete_instance(instance_id)
        
        return {
            "message": "Instance terminated successfully",
            "instance_id": instance_id
        }
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'InvalidInstanceID.NotFound':
            delete_instance(instance_id)
            raise HTTPException(status_code=404, detail="Instance not found")
        raise HTTPException(status_code=500, detail=f"AWS error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/api/instances")
async def get_all_instances():
    """
    Get all managed instances
    
    Returns list of all instance IDs and their status
    """
    instances = load_instances()
    if not instances:
        return {
            "total": 0,
            "instances": []
        }
    
    instances_list = []
    for instance_id, data in instances.items():
        instances_list.append({
            "instance_id": instance_id,
            "status": data.get("status"),
            "public_ip": data.get("public_ip"),
            "blob_id": data.get("blob_id"),
            "created_at": data.get("created_at")
        })
    
    return {
        "total": len(instances_list),
        "instances": instances_list
    }

@app.get("/api/instances/{instance_id}")
async def get_instance_details(instance_id: str):
    """
    Get detailed information about specific instance
    
    - **instance_id**: EC2 instance ID
    
    Returns both stored data and live AWS data
    """
    local_data = get_instance(instance_id)
    
    # Get live data from AWS
    try:
        response = ec2_client.describe_instances(InstanceIds=[instance_id])
        
        if not response['Reservations']:
            delete_instance(instance_id)
            raise HTTPException(status_code=404, detail="Instance not found")
        
        instance = response['Reservations'][0]['Instances'][0]
        
        aws_data = {
            "instance_id": instance['InstanceId'],
            "state": instance['State']['Name'],
            "instance_type": instance['InstanceType'],
            "public_ip": instance.get('PublicIpAddress'),
            "private_ip": instance.get('PrivateIpAddress'),
            "launch_time": instance['LaunchTime'].isoformat(),
            "ami_id": instance['ImageId']
        }
        
        # Combine with local data if available
        if local_data:
            return {
                **aws_data,
                "blob_id": local_data.get("blob_id"),
                "processing_status": local_data.get("status"),
                "created_at": local_data.get("created_at"),
                "error": local_data.get("error")
            }
        else:
            return aws_data
            
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'InvalidInstanceID.NotFound':
            delete_instance(instance_id)
            raise HTTPException(status_code=404, detail="Instance not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting AWS EC2 + Walrus Manager")
    print(f"📍 Region: {AWS_REGION}")
    print(f"📋 Launch Template: {AWS_LAUNCH_TEMPLATE_ID}")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

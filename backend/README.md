# AWS EC2 + Walrus Manager

# Python version 3.11
FastAPI application for managing AWS EC2 instances with Walrus blob storage integration.

## Features

- ✅ **Create EC2 Instance**: Spin up EC2 instances from custom AMI template
- ✅ **Fetch Walrus Blobs**: Automatically SSH and download blobs from Walrus network
- ✅ **Delete Instances**: Terminate EC2 instances
- ✅ **List All Instances**: View all managed instances
- ✅ **Get Instance Details**: Detailed information about specific instances

## API Endpoints

### POST `/api/instances`
Create new EC2 instance and fetch Walrus blob
```json
{
  "blob_id": "your-walrus-blob-id"
}
```
Returns: `instance_id` immediately (processing happens in background)

### DELETE `/api/instances/{instance_id}`
Terminate EC2 instance

### GET `/api/instances`
Get all managed instances with their status

### GET `/api/instances/{instance_id}`
Get detailed information about a specific instance

### GET `/`
Health check endpoint

## Setup

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Configure environment variables**:
```bash
cp .env.example .env
```

Edit `.env` with your AWS credentials and configuration:
- `AWS_REGION`: AWS region (default: us-east-1)
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `AWS_AMI_ID`: **Your custom AMI template ID (must have SSM agent installed)**
- `AWS_INSTANCE_TYPE`: Instance type (default: t2.medium)
- `AWS_SECURITY_GROUP_ID`: Security group ID
- `AWS_SUBNET_ID`: Optional subnet ID

3. **IAM Requirements**:
- Create IAM role `SSMManagedInstanceCore` with `AmazonSSMManagedInstanceCore` policy
- Attach this role to your EC2 instances for SSM access

4. **Run the application**:
```bash
python main.py
# or
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Example Usage

### Create Instance
```bash
curl -X POST http://localhost:8000/api/instances \
  -H "Content-Type: application/json" \
  -d '{"blob_id": "your-blob-id-here"}'
```

### Get All Instances
```bash
curl http://localhost:8000/api/instances
```

### Get Instance Details
```bash
curl http://localhost:8000/api/instances/i-1234567890abcdef0
```

### Delete Instance
```bash
curl -X DELETE http://localhost:8000/api/instances/i-1234567890abcdef0
```

## Instance Status Flow

1. `creating` - EC2 instance is being launched
2. `waiting_for_instance` - Waiting for instance to be running
3. `waiting_for_ssm` - Waiting for SSM agent to be ready
4. `fetching_blob` - Downloading blob from Walrus via SSM
5. `ready` - Instance ready with blob downloaded
6. `failed` - Something went wrong (check error field)

## Requirements

- Python 3.8+
- AWS Account with EC2 and SSM permissions
- IAM role `SSMManagedInstanceCore` 
- Custom AMI ID with SSM agent pre-installed
- Security Group configured

## Architecture

- **FastAPI**: Modern Python web framework
- **Boto3**: AWS SDK for Python
- **AWS SSM**: Systems Manager for remote command execution
- **Asyncio**: Non-blocking background processing

## Notes

- Instances are created asynchronously
- Blob fetching happens automatically after instance is ready
- Downloaded blobs are stored at `/home/ubuntu/walrus_blob.zip` on EC2
- Extracted files are in `/home/ubuntu/walrus_data/`

# AWS EC2 + Walrus Manager

**Python version 3.11**

FastAPI application for managing AWS EC2 instances with Walrus blob storage integration. This service automates the creation of EC2 instances and fetches ML models from the Walrus decentralized storage network.

## Features

- ✅ **Create EC2 Instance**: Launch EC2 instances from AWS Launch Template
- ✅ **Fetch Walrus Blobs**: Automatically download and extract blobs from Walrus network via SSM
- ✅ **Delete Instances**: Terminate EC2 instances and cleanup data
- ✅ **List All Instances**: View all managed instances with their status
- ✅ **Get Instance Details**: Detailed information combining local tracking and live AWS data
- ✅ **Persistent Storage**: JSON-based instance tracking across restarts

## API Endpoints

### POST `/api/instances`
Create new EC2 instance and fetch Walrus blob (synchronous - waits for completion)
```json
{
  "blob_id": "your-walrus-blob-id"
}
```
Returns: Complete instance details after setup is done, including `instance_id`, `public_ip`, and `status`

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
Create a `.env` file in the backend directory with:
```bash
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_LAUNCH_TEMPLATE_ID=lt-xxxxxxxxxxxxxxxxx
```

**Environment Variables:**
- `AWS_REGION`: AWS region (default: ap-south-1)
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `AWS_LAUNCH_TEMPLATE_ID`: **Your Launch Template ID (must be pre-configured with SSM agent)**

3. **AWS Launch Template Requirements**:
Your Launch Template must be configured with:
- AMI with SSM agent pre-installed (Amazon Linux 2 or Ubuntu with SSM)
- IAM role with `AmazonSSMManagedInstanceCore` policy attached
- Security group allowing necessary inbound/outbound traffic
- Appropriate instance type (e.g., t2.medium, t3.medium)
- Storage configuration as needed

4. **Activate virtual environment** (optional but recommended):
```bash
# On Windows PowerShell
.\env\Scripts\Activate.ps1

# On Linux/Mac
source env/bin/activate
```

5. **Run the application**:
```bash
python main.py
# or
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The server will start on `http://localhost:8000` with automatic reload enabled.

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

The API tracks instances through these states:

1. **`waiting_for_instance`** - EC2 instance is being launched from Launch Template
2. **`waiting_for_ssm`** - Instance is running, waiting for SSM agent to be ready
3. **`fetching_blob`** - Downloading and extracting blob from Walrus network via SSM
4. **`ready`** - Instance is fully operational with model deployed
5. **`failed`** - Something went wrong (check the error field for details)

## Requirements

- **Python 3.11+**
- **AWS Account** with EC2 and SSM permissions
- **AWS Launch Template** pre-configured with:
  - IAM role with `AmazonSSMManagedInstanceCore` policy
  - AMI with SSM agent pre-installed (Ubuntu/Amazon Linux 2)
  - Security group configured for your needs
- **AWS Credentials** with permissions for `ec2:RunInstances`, `ec2:DescribeInstances`, `ec2:TerminateInstances`, `ssm:SendCommand`, `ssm:GetCommandInvocation`

## Architecture

- **FastAPI**: Modern async Python web framework with automatic API documentation
- **Boto3**: AWS SDK for Python (EC2 and SSM clients)
- **AWS SSM**: Systems Manager for secure remote command execution without SSH
- **Asyncio**: Non-blocking operations for instance provisioning
- **JSON Storage**: Persistent instance tracking in `instances_data.json`
- **CORS Enabled**: Full cross-origin support for frontend integration

## Technical Details

### Instance Provisioning Process
1. API receives blob_id and creates EC2 instance from Launch Template
2. Instance is tagged with auto-generated name (`walrus-vm-YYYYMMDD-HHMMSS`)
3. Waits for instance to reach "running" state and obtain public IP
4. Polls SSM until agent is ready (up to 5 minutes)
5. Executes remote command via SSM to download and extract Walrus blob
6. Model setup script is automatically executed

### Blob Fetching Command
The service runs the following on each instance:
```bash
cd /tmp
curl -L "https://aggregator.walrus-testnet.walrus.space/v1/blobs/by-object-id/{blob_id}" -o model.zip
apt install python3.12-venv -y
unzip -o model.zip
cd model
chmod +x ./script.sh
bash ./script.sh &
```

### Data Persistence
- All instance metadata is stored in `instances_data.json`
- Survives application restarts
- Tracks: instance_id, blob_id, status, public_ip, created_at, errors

## Notes

- **Synchronous API**: POST endpoint waits for complete setup (can take 5-10 minutes)
- **Timeout Settings**: Instance start (300s), SSM ready (300s), Command execution (150s)
- **Automatic Cleanup**: Instance data is removed when instance is terminated or not found
- **Background Execution**: Model script runs in background after extraction
- **File Locations on EC2**: 
  - Download: `/tmp/model.zip`
  - Extracted: `/tmp/model/`
  - Script: `/tmp/model/script.sh`

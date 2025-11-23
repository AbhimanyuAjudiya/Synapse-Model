scp -i manage_keys main.py ubuntu@81.15.150.142:/home/ubuntu/  
scp -i manage_keys requirements.txt ubuntu@81.15.150.142:/home/ubuntu/
scp -i manage_keys .env ubuntu@81.15.150.142:/home/ubuntu/
scp -i manage_keys mykey.pub ubuntu@81.15.150.142:/home/ubuntu/
scp -i manage_keys mykey ubuntu@81.15.150.142:/home/ubuntu/

apt install python3 unzip python3-pip virtualenv -y
virtualenv env
source env/bin/activate
pip install -r requirements.txt     
python3 main.py
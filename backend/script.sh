curl -sSL https://bootstrap.pypa.io/get-pip.py | python3
python3 -m pip install fastapi uvicorn joblib scikit-learn
cd /home/ubuntu/model/model
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000

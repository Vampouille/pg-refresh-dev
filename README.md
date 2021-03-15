virtualenv -p python3 venv
. venv/bin/activate
pip install -r requirements.txt
FLASK_APP=pg-refresh-dev/server.py FLASK_ENV=development flask run

import os
import re
import concurrent.futures
from flask import Flask, render_template, send_from_directory, jsonify

from task import Task
from db import DB

# Load databases
dbs_id = re.split(r'\s*,\s*', os.environ.get('PG_REFRESH_DEV_DATABASES', 'CSV')) 
dbs = {}
for db_id in dbs_id:
    dbs[db_id] = DB(db_id)

executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
tasks = {}
app = Flask(__name__)
for x in range(0, 5):
    task = Task(executor, 'PROD', 'DEV')
    tasks[task.id] = task

@app.route('/assets/<path:path>')
def send_assets(path):
    return send_from_directory('assets', path)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/task/', methods=['GET'])
def tasks_list():
    return jsonify([t.to_dict() for t in tasks.values()])

@app.route('/refresh')
@app.route('/api/task/', methods=['POST'])
def create_task():
    task = Task(executor, 'PROD', 'DEV') 
    tasks[task.id] = task
    return jsonify(task.to_dict())


@app.route('/api/task/<id>', methods=['GET'])
def get_task(id):
    return jsonify(tasks[id])

# Database API
@app.route('/api/database/', methods=['GET'])
def dbs_list():
    return jsonify([d.to_dict() for d in dbs.values()])

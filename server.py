import concurrent.futures
import time
from flask import Flask, render_template, send_from_directory, jsonify

from task import Task

executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
tasks = []
app = Flask(__name__)


@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('js', path)


@app.route('/')
def hello_world():
    return render_template('tasks.html')


@app.route('/refresh')
def refresh():
    
    tasks.append(Task(executor.submit(do_refresh, 'PROD', 'DEV'), 'PROD', 'DEV'))
    return 'New task running'


def do_refresh(db_from, db_to):
    time.sleep(30)
    return 'OK: %s -> %s' % (db_from, db_to)
  

@app.route('/api/task/')
def tasks_list():
    return jsonify([t.to_dict() for t in tasks])
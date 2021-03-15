import concurrent.futures
from flask import Flask, render_template, send_from_directory, jsonify

from task import Task

executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
tasks = {}
app = Flask(__name__)


@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('js', path)


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/task/', methods=['GET'])
def tasks_list():
    return jsonify([t.to_dict() for t in tasks.values() ])

@app.route('/refresh')
@app.route('/api/task/', methods=['POST'])
def create_task():
    task = Task(executor, 'PROD', 'DEV') 
    tasks[task.id] = task
    return jsonify(task.to_dict())


@app.route('/api/task/<id>', methods=['GET'])
def get_task(id):
    return jsonify(tasks[id])
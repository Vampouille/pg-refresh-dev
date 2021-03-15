import concurrent.futures
import time
from flask import Flask, render_template, send_from_directory

executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
tasks = []
app = Flask(__name__)


@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('js', path)


@app.route('/')
def hello_world():
    return render_template('tasks.html', tasks=tasks)
    res = "Tasks:<ul>"
    for task in tasks:
        if task.cancelled():
            res += "<li>Task cancelled</li>"
        elif task.running():
            res += "<li>Task running</li>"
        elif task.done():
            res+= "<li>Taks done</li>"
        else:
            res += "<li>Task not started</li>"
    return res


@app.route('/refresh')
def refresh():
    tasks.append(executor.submit(do_refresh, 'PROD', 'DEV'))
    return 'New task running'


def do_refresh(db_from, db_to):
    time.sleep(30)
    return 'OK: %s -> %s' % (db_from, db_to)

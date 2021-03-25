from task import Task
import concurrent.futures

executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)

task = Task(executor, 'prod', 'dev')
task.run()

print("State: %s " % task.state)
print("Message: %s" % task.message)
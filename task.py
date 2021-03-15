from concurrent.futures import Future
import uuid
import time


class Task():

    def __init__(self, executor, db_from: str, db_to: str):
        self.id = str(uuid.uuid1())
        self.future = executor.submit(self.run)
        self.db_from = db_from
        self.db_to = db_to

    
    def to_dict(self):
        return {'id': self.id,
                'state': self.state(),
                'db_from': self.db_from,
                'db_to': self.db_to}

    def state(self):
        if self.future.cancelled():
            return "Cancelled"
        elif self.future.running():
            return "Running"
        elif self.future.done():
            return "Done"
        else:
            return "Pending"

    def run(self):
        time.sleep(10)        
        return 'OK: %s -> %s' % (self.db_from, self.db_to)

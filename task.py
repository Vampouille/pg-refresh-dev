from concurrent.futures import Future
import uuid
import time
from datetime import datetime
import locale

locale.setlocale(locale.LC_TIME, "fr_FR.utf8")


class Task():

    def __init__(self, executor, db_from: str, db_to: str):
        self.id = str(uuid.uuid1())
        self.future = executor.submit(self.run)
        self.db_from = db_from
        self.db_to = db_to
        self.start = None
        self.end = None


    def duration(self):
        try:
            return self.end - self.start
        except TypeError:
            return None
    
    def to_dict(self):
        return {'id': self.id,
                'state': self.state(),
                'db_from': self.db_from,
                'db_to': self.db_to,
                'start': str(self.start),
                'end': str(self.end),
                'duration': str(self.duration())}

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
        self.start = datetime.now().replace(microsecond=0)
        time.sleep(10)
        self.end = datetime.now().replace(microsecond=0)
        return 'OK: %s -> %s' % (self.db_from, self.db_to)

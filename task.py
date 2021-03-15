from concurrent.futures import Future

class Task():

    def __init__(self, task: Future, db_from: str, db_to: str):
        self.future = task
        self.db_from = db_from
        self.db_to = db_to
    
    def to_dict(self):
        return {'state': self.state(),
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

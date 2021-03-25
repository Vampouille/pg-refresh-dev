from concurrent.futures import Future
import uuid
import time
from subprocess import run, Popen, PIPE
from threading import Thread
from datetime import datetime
import locale

locale.setlocale(locale.LC_TIME, "fr_FR.utf8")

class StdErr(Thread):                           
    def __init__(self, stream):                 
        Thread.__init__(self)                   
        self.stream = stream                    
        self.output = ""                        
                                                
    def run(self):                              
        try:
            while True:                             
                output = self.stream.read().decode()
                print('stderr read: %s' % len(output))
                print(output)
                self.output += output
                if len(output) == 0:                
                    break         
        except ValueError:
            print("Process seems finished")
            return

class Task():

    def __init__(self, executor, db_from: str, db_to: str):
        self.id = str(uuid.uuid1())
        self.future = executor.submit(self.run)
        self.db_from = db_from
        self.db_to = db_to
        self.db_size = None
        self.start = None
        self.end = None
        self.backup_bytes = 0
        self.copy_bytes = 0
        self.message = ""


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
                'db_size': self.db_size,
                'start': str(self.start),
                'end': str(self.end),
                'duration': str(self.duration()),
                'backup_bytes': self.backup_bytes,
                'copy_bytes': self.copy_bytes}

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

        try:
            # Check DB size
            psql_db_size = run(['psql', '-qAtX', '-c', "SELECT pg_database_size('%s')" % self.db_from], capture_output=True)
            self.db_size = int(psql_db_size.stdout)
            print('DB size: %s' % self.db_size)

            # Backup DB first
            #self.backup_db()
            #print('Backup finished')

            # Transfer DB
            self.transfer_db()

            self.end = datetime.now().replace(microsecond=0)
            self.state = "Done"
        except Exception as e:
            self.state = "Error"
            self.message = str(e)

    def backup_db(self):
        dest = '/tmp/%s_%s.custom' % (self.db_to, str(self.start))
        input_cmd = 'pg_dump -Fc -v -d %s' % self.db_to
        print("Running: %s" % input_cmd)
        buffer = bytearray(1000000)
        with open(dest, 'wb') as output:
            with Popen(input_cmd.split(), stdout=PIPE, stderr=PIPE) as input:
                s = StdErr(input.stderr)
                s.start()
                while True:

                    # Retrieve data from input in the buffer
                    bytes_read = input.stdout.readinto(buffer)

                    if bytes_read == 0:
                        break
                    if bytes_read != 1000000:
                        output.write(buffer[:bytes_read])
                    else:
                        output.write(buffer)
                    self.backup_bytes += bytes_read
                    print("Backup bytes: %s" % self.backup_bytes)

                if input.poll() is not None:
                    if self.backup_bytes == 0 or input.returncode != 0:
                        raise Exception('DB Backup: no data transfered or error on pg_dump: %s' % s.output)
                else:
                    raise Exception('Read of input finished but process is not finished, should not happen')

    def transfer_db(self):
        input_cmd = 'pg_dump -Fc -v -d %s' % self.db_from
        output_cmd = 'pg_restore -Fc -v -d %s' % self.db_to
        print("Running %s | %s" % (input_cmd, output_cmd))
        buffer = bytearray(1000000)
        with Popen(output_cmd.split(), stdin=PIPE, stderr=PIPE) as output:
            s_output = StdErr(output.stderr)
            s_output.start()
            with Popen(input_cmd.split(), stdout=PIPE, stderr=PIPE) as input:
                s_input = StdErr(input.stderr)
                s_input.start()
                while True:

                    # Retrieve data from input in the buffer
                    print("Reading input")
                    bytes_read = input.stdout.readinto(buffer)

                    print("Trying to write %s" % bytes_read)
                    if bytes_read == 0:
                        break
                    elif bytes_read != 1000000:
                        output.stdin.write(buffer[:bytes_read])
                    else:
                        output.stdin.write(buffer)
                    self.copy_bytes += bytes_read
                    print("Copy bytes: %s" % self.copy_bytes)

                if input.poll() is not None:
                    if self.copy_bytes == 0:
                        raise Exception('DB Transfer: no data transfered')
                    if input.returncode != 0:
                        raise Exception('DB Transfer: error on pg_dump: %s' % s_input.output)
                else:
                    raise Exception('Read of input finished but process is not finished, should not happen')
            output.wait()
            if output.poll() is not None:
                if self.copy_bytes == 0:
                    raise Exception('DB Transfer: no data transfered')
                if output.returncode != 0:
                    raise Exception('DB Transfer: error on pg_restore: %s' % s_output.output)
            else:
                raise Exception('Read of input finished but process is not finished, should not happen')

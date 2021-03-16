import os

class DB():
    def __init__(self, id):
        self.id = id
        self.hostname = os.environ.get('PG_REFRESH_DEV_%s_PGHOST' % id.upper(),os.environ.get('PGHOST'))
        self.port = os.environ.get('PG_REFRESH_DEV_%s_PGPORT' % id.upper(),os.environ.get('PGPORT','5432'))
        self.database = os.environ.get('PG_REFRESH_DEV_%s_PGDATABASE' % id.upper(),os.environ.get('PGDATABASE'))
        self.user = os.environ.get('PG_REFRESH_DEV_%s_PGUSER' % id.upper(),os.environ.get('PGUSER'))
        self.password = os.environ.get('PG_REFRESH_DEV_%s_PGPASSWORD' % id.upper(),os.environ.get('PGPASSWORD'))
        self.check_config()

    def check_config(self):
        if self.hostname is None:
            raise Exception("Hostname is not defined for DB %s, set either PGHOST or PG_REFRESH_DEV_%s_PGHOST" % self.id.upper())
        if self.database is None:
            raise Exception("Database is not defined for DB %s, set either PGDATABASE or PG_REFRESH_DEV_%s_PGDATABASE" % self.id.upper())
        if self.user is None:
            raise Exception("User is not defined for DB %s, set either PGUSER or PG_REFRESH_DEV_%s_PGUSER" % id.upper())
        if self.password is None:
            raise Exception("Password is not defined for DB %s, set either PGPASSWORD or PG_REFRESH_DEV_%s_PGPASSWORD" % id.upper())

    def to_dict(self):
        return {'id': self.id,
                'hostname': self.hostname,
                'database': self.database,
                'user': self.user}

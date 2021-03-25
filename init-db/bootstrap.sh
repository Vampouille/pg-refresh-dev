#!/bin/bash

for db in $(echo $DBS); do
    createdb $db
    pgbench -i --scale=$DB_SCALE $db
done
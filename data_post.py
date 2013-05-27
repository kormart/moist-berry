#!/usr/bin/python

#import glob
import time
from time import localtime
import httplib, urllib, socket
import serial
def getLatestStatus():
    while ser.inWaiting() > 0:
        status = ser.readline()
    return status


ser = serial.Serial('/dev/ttyACM0', 9600)

while 1:
    ser.write('7')
    time_now = localtime()
    day = time_now.tm_yday
    hour = time_now.tm_hour
    minute = time_now.tm_min
    second = time_now.tm_sec
    string = str(day) + "." + str(hour).zfill(2) + "." + str(minute).zfill(2) + "." + str(second).zfill(2) + ":" + getLatestStatus()
#    print string
#    params = urllib.urlencode({'spam': 1, 'eggs': 2, 'bacon': 0})
    headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/plain"}

    try:
       conn = httplib.HTTPConnection("<your_vm>.compute-1.amazonaws.com:8000")
       conn.request("GET", "/test-page?name=" + string)
       response = conn.getresponse()
#       print response.status
       data = response.read()
       conn.close()
    except (httplib.HTTPException, socket.error) as ex:
       print "Error: %s" % ex
#    print '%s:%s'%(string, string2)
    time.sleep(60)
   

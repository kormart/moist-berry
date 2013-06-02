#!/usr/bin/python

#import glob
import time
from time import localtime
import httplib, urllib, socket
import serial
import os

def getLatestStatus():
    while ser.inWaiting() > 0:
        status = ser.readline()
    return status


ser = serial.Serial('/dev/ttyACM0', 9600)
mode = "7"

while 1:
#    mode = os.getenv('MODE')
#    print mode
    ser.write(mode)
    time.sleep(2)
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
       conn = httplib.HTTPConnection("ec2-23-22-150-152.compute-1.amazonaws.com:8000")
       conn.request("GET", "/test-page?name=" + string)
       response = conn.getresponse()
       mode = response.read()
#       print data
       conn.close()
    except (httplib.HTTPException, socket.error) as ex:
       print "Error: %s" % ex
#    print '%s:%s'%(string, string2)
    time.sleep(58)
   

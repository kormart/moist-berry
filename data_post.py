#!/usr/bin/python

import time
from time import localtime
import requests
import serial

def getLatestStatus():
    while ser.inWaiting() > 0:
        status = ser.readline()
    return status

ser = serial.Serial('/dev/ttyACM0', 9600)
mode = '7'

while 1:
    ser.write(mode)
    time.sleep(2)
    time_now = localtime()
    day = time_now.tm_yday
    hour = time_now.tm_hour
    minute = time_now.tm_min
    second = time_now.tm_sec
    string = str(day) + "." + str(hour).zfill(2) + "." + str(minute).zfill(2) + "." + str(second).zfill(2) + ":" + getLatestStatus()

    try:
       url = "http://backabo.net:8000/test-page?name=" + string
       response = requests.get(url)
       mode = str(response.text)
       print mode
    except (requests.ConnectionError) as ex:
       print "Error: %s" % ex
#    print '%s:%s'%(string, string2)
    time.sleep(58)
   

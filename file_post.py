#!/usr/bin/python

#import glob
import time
#from time import localtime
#import httplib, urllib, socket
import requests

while 1:
    time.sleep(30)
    try:
        url = 'http://ec2-23-22-150-152.compute-1.amazonaws.com:3000/upload'
        files = {'file': ('lastsnap.jpg', open('lastsnap.jpg', 'rb'))}
        response = requests.post(url, files=files)
#   print response.status_code, response.text
    except (requests.ConnectionError) as ex:
       print "Error: %s" % ex
    time.sleep(30)


#!/usr/bin/python

import time
import requests

while 1:
    time.sleep(30)
    try:
        url = 'http://backabo.net:3000/upload'
        files = {'file': ('lastsnap.jpg', open('lastsnap.jpg', 'rb'))}
        response = requests.post(url, files=files)
#   print response.status_code, response.text
    except (requests.ConnectionError) as ex:
       print "Error: %s" % ex
    time.sleep(30)


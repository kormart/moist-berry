moist-berry
===========

Irrigation project with Arduino and Raspberry Pi.
  Inspired by http://cm.cdn.fm/fakeup/dow-make/cmweb/entry_assets/MAKE18_Garduino_brnd.pdf

## Setting up Raspberry Pi for Arduino
    sudo apt-get update
    sudo apt-get install arduino
    
## Accessing Arduino via Serial from Python    
Install pySerial from http://pyserial.sourceforge.net/

    python setup.py install

http://playground.arduino.cc/interfacing/python

    import serial
    ser = serial.Serial('/dev/tty.usbserial', 9600)
    ser.readline()
    ser.write('5')
    
## Example Python code for Raspberry Pi side
Posting data to web server.
    import httplib, urllib
    params = urllib.urlencode({'spam': 1, 'eggs': 2, 'bacon': 0})
    headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/plain"}
    conn = httplib.HTTPConnection("musi-cal.mojam.com:80")
    conn.request("POST", "/cgi-bin/query", params, headers)
    response = conn.getresponse()
    print response.status, response.reason
    data = response.read()
    conn.close()

## Example code for Arduino

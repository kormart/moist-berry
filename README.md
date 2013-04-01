moist-berry
===========

Irrigation project with Arduino and Raspberry Pi.
  Inspired by http://cm.cdn.fm/fakeup/dow-make/cmweb/entry_assets/MAKE18_Garduino_brnd.pdf

## Setting up Raspberry Pi for Arduino

### Updating Raspberry

    sudo apt-get update
    sudo apt-get install arduino

### Enabling remote login to the Raspberry.

    sudo apt-get install ssh
    sudo /etc/init.d/ssh start
    cat ~/.ssh/id_rsa.pub | ssh pi@10.0.1.9 "mkdir .ssh;cat >> .ssh/authorized_keys"
    
    sudo vi /etc/ssh/sshd_config
    scroll down to the section that says #PasswordAuthentication yes
    With the cursor over the # press x
    Then scroll the console to the end and press i
    Then press backspace to delete the word yes and replace it to no
    Then press the escape key, press : and then w, then press : and then q

    sudo /etc/init.d/ssh restart

### Accessing Arduino via Serial from Python    
Install pySerial from http://pyserial.sourceforge.net/

    python setup.py install

http://playground.arduino.cc/interfacing/python

    import serial
    ser = serial.Serial('/dev/tty.usbserial', 9600)
    ser.readline()
    ser.write('5')
    
### Posting data to web server.

    import httplib, urllib
    params = urllib.urlencode({'spam': 1, 'eggs': 2, 'bacon': 0})
    headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/plain"}
    conn = httplib.HTTPConnection("musi-cal.mojam.com:80")
    conn.request("POST", "/cgi-bin/query", params, headers)
    response = conn.getresponse()
    print response.status, response.reason
    data = response.read()
    conn.close()

## Setting up Arduino

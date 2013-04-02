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
    
    sudo nano /etc/ssh/sshd_config
    scroll down to the section that says #PasswordAuthentication yes

    sudo nano /etc/rc.local
    scroll down, before exit 0, add line 
    /etc/init.d/ssh start

    sudo /etc/init.d/ssh restart
    sudo reboot

### Accessing Arduino via Serial from Python    
Install pySerial from http://pyserial.sourceforge.net/

    python setup.py install

http://playground.arduino.cc/interfacing/python
http://www.doctormonk.com/2012/04/raspberry-pi-and-arduino.html

    import serial
    ser = serial.Serial('/dev/ttyACM0', 9600)
    ser.readline()
    ser.write('5')
    
### Posting data to web server.

    #!/usr/bin/python

    import time
    from time import localtime
    import httplib, urllib

    while 1:
      time_now = localtime()
      hour = time_now.tm_hour
      minute = time_now.tm_min
      second = time_now.tm_sec
      string = str(hour) + ":" + str(minute) + ":" + str(second)

      headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/plain"}
      conn = httplib.HTTPConnection("ec2-23-22-150-152.compute-1.amazonaws.com:8000")
      conn.request("GET", "/test-page?name=" + string)
      response = conn.getresponse()
      print response.status, response.reason
      data = response.read()
      conn.close()

      print '%s   %i:%i:%i'%(string, hour, minute, second)
      time.sleep(11)

## Setting up Arduino

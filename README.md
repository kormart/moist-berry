moist-berry
===========

Irrigation project with Arduino and Raspberry Pi.

Inspired by http://cm.cdn.fm/fakeup/dow-make/cmweb/entry_assets/MAKE18_Garduino_brnd.pdf

2013-04 First version operational during springbreak vacation  
2013-05 Second version under test (Arduino sw r0.47 is stable, r0.5 introduces mode, )  
To do list
- [ ] Risk that pump 1 isn't powerful enough to drive water through nozzles. Mitigated by using Pump 0 directly.  
- [ ] Choose watering algorithm using serial write of a "mode number" from R-Pi to Arduino. Almost done.  
- [ ] Webcam for visual monitoring. Problems with stability of Webcom USB connection to Motion server; tried turning off stuff and chaing port numbers.  
- [ ] Monitoring functions  

Modes: 5: Water once per day, 6: Water 1 minute every 10 minutes, 7: Water using level 1 switch

## Setting up Raspberry Pi for Arduino

### Creating SD card for Raspberry
Following http://elinux.org/RPi_Easy_SD_Card_Setup

    diskutil unmountDisk /dev/disk2
    sudo dd bs=1m if=<wheezy image file> of=/dev/disk2

### Updating Raspberry and installing git

    sudo apt-get update
    sudo apt-get install git-core

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

### Raspberry Pi Webcam server
This camera works very well: Microsoft LifeCam Cinema 720p HD Webcam - Black   
I have problems with the Motion software, trying fswebcam instead

    sudo apt-get install fswebcam
    fswebcam -r 640x480 -S 15 --jpeg 95 --shadow --title "Moist-Berry" --subtitle "" --timestamp "%Y-%m-%d %H:%M" --save lastsnap.jpg -q -l 60

But the Motion software is great, if it only worked.   
http://www.lavrsen.dk/foswiki/bin/view/Motion/DownloadFiles  

    sudo apt-get install motion
    sudo apt-get install libv4l-0
    sudo apt-get install uvccapture
    sudo nano /etc/default/motion
    sudo nano /etc/motion/motion.conf
    sudo chmod 777 /media
    sudo /etc/init.d/motion start
    tail -f /var/log/syslog
    dmesg | tail
    sudo /etc/init.d/motion stop
    du -h /tmp/motion/

Uploading image files. Trying out the 'requests' module for Python.   
http://docs.python-requests.org/en/latest/

    curl -OL https://github.com/kennethreitz/requests/tarball/master
    python setup.py install
    mv master requests.tar.gz
    gunzip requests.tar.gz
    tar xf requests.tar
    cd kennethreitz-requests-3bb13f8/
    sudo python setup.py install

Python code to POST image file

    url = 'http://<your server>.compute-1.amazonaws.com:3000/upload'
    files = {'file': ('latest.jpg', open('latest.jpg', 'rb'))}
    response = requests.post(url, files=files)

Receiving on the Express side

    app.use(express.bodyParser({uploadDir:'./uploads'}));
    app.post('/upload', function(req, res) {
      // get the temporary location of the file
      var tmp_path = req.files.file.path;
      // set where the file should actually exists - in this case it is in the "images" directory
      var target_path = './public/images/' + req.files.file.name;
      // move the file from the temporary location to the intended location
      fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
          if (err) throw err;
          res.send('File uploaded to: ' + target_path + ' - ' + req.files.file.size + ' bytes');
        });
      });
    });

### Compiling and uploading Arduino code from Raspberry Pi command line
http://www.jamesrobertson.eu/blog/2012/sep/20/uploading-a-sketch-from-the-comman.html  
Only arduino-mk is needed if you only want to compile and upload

    sudo apt-get install arduino-mk

If you want to do more stuff I guess you can do this, but I don't know exactly the difference

    sudo apt-get install arduino


Makefile like this:

    ARDUINO_DIR = /usr/share/arduino
    BOARD_TAG    = uno
    ARDUINO_PORT = /dev/ttyACM0
    ARDUINO_LIBS = /usr/share/arduino/libraries/
    include /usr/share/arduino/Arduino.mk

Compile the .ino file in the directory and upload to Arduino

    make upload

### Send/receive data between Arduino and R-Pi Python via Serial
Install pySerial from http://pyserial.sourceforge.net/

    tar xf pyserial-2.6.tar 
    cd pyserial-2.6
    sudo python setup.py install

http://playground.arduino.cc/interfacing/python  
http://www.doctormonk.com/2012/04/raspberry-pi-and-arduino.html

    #!/usr/bin/python
    import serial
    ser = serial.Serial('/dev/ttyACM0', 9600)
    ser.readline()
    ser.write('5')
    
Strings are sent as ASCII code on Serial line, so when picking it up on Arduino side, you can do

    char mode = 'e';
    void setup() {
      Serial.begin(9600);
    }
    void loop() {
      if (Serial.available() > 0) {
        mode = (char)Serial.read();
      }
    }

### Arduino time library
http://playground.arduino.cc/Code/time

### Posting data to web server.

    #!/usr/bin/python
    import time
    from time import localtime
    import httplib, urllib, socket
    import serial
    ser = serial.Serial('/dev/ttyACM0', 9600)

    while 1:
        time_now = localtime()
        hour = time_now.tm_hour
        minute = time_now.tm_min
        second = time_now.tm_sec
        string = str(hour) + ":" + str(minute) + ":" + str(second) + ser.readline()
        
        headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/plain"}
        try:
           conn = httplib.HTTPConnection("ec2-your-server.compute-1.amazonaws.com:8000")
           conn.request("GET", "/test-page?name=" + string)
           response = conn.getresponse()
    # print response.status, response.reason
           data = response.read()
           conn.close()
        except (httplib.HTTPException, socket.error) as ex:
           print "Error: %s" % ex        
    # print '%s'%(string)
        time.sleep(25)

## Arduino sketch for water pump control
Using the Relay Shield: http://seeedstudio.com/wiki/Relay_Shield_V2.0  
Going to use the Time library: http://playground.arduino.cc/Code/time

    /*
     Prototype Water pump control using Seeedstudio Relay Shield v2.0   
      
     Reads an analog input pin, maps the result to a range from 0 to 255
     and uses the result to set the pulsewidth modulation (PWM) of an output pin.
     Also prints the results to the serial monitor.
     
     The circuit:
     * potentiometer connected to analog pin 0.
     * LED connected from digital pin 9 to ground
 
    */

    // These constants won't change.  They're used to give names
    // to the pins used:
    const int analogInPin = A0;  // Analog input pin that the potentiometer is attached to
    const int analogOutPin = 9; // Analog output pin that the LED is attached to
    const int relayPin = 7; // the pin to use for relay control
    
    int sensorValue = 0;        // value read from the pot
    int outputValue = 0;        // value output to the PWM (analog out)   
    
    void setup() {  
    // initialize serial communications at 9600 bps:
      Serial.begin(9600); 
    // the pin to use for relay control
      pinMode(relayPin, OUTPUT);
    }

    void loop() {
      // read the analog in value:
      sensorValue = analogRead(analogInPin);            
      // map it to the range of the analog out:
      outputValue = map(sensorValue, 0, 1023, 0, 255);  
      // change the analog out value:
      analogWrite(analogOutPin, outputValue);           

      // print the results to the serial monitor:
      Serial.print("s" );                       
      Serial.print(sensorValue);      
      Serial.print(":c");      
      Serial.println(outputValue);   

      if (outputValue > 128) {
        digitalWrite(relayPin, HIGH);
      }
      else {
        digitalWrite(relayPin, LOW);
      }    

      // wait 200 milliseconds before the next loop
      delay(200);                     
    }

### Running MongoDb on EC2
Sometimes cleaning old data

    db.users.remove( { "time": { $lt: "140" } } )
    
### Running it
Raspberry Pi

    sudo python time-post5.py &

Amazon

    node server_mod.js
    

moist-berry
===========

Irrigation project with Arduino and Raspberry Pi.

Inspired by http://cm.cdn.fm/fakeup/dow-make/cmweb/entry_assets/MAKE18_Garduino_brnd.pdf

- [ ] Make a moisture sensor, right now it's just a potentiometer
- [ ] Implement water pump algorithm

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

    sudo python setup.py install

http://playground.arduino.cc/interfacing/python
http://www.doctormonk.com/2012/04/raspberry-pi-and-arduino.html

    python
    import serial
    ser = serial.Serial('/dev/ttyACM0', 9600)
    ser.readline()
    ser.write('5')
    
### Loading Arduino sketches from Raspberry Pi command line
http://www.jamesrobertson.eu/blog/2012/sep/20/uploading-a-sketch-from-the-comman.html

    sudo apt-get install arduino
    sudo apt-get install arduino-mk

Makefile like this:

    ARDUINO_DIR = /usr/share/arduino
    BOARD_TAG    = uno
    ARDUINO_PORT = /dev/ttyACM0
    ARDUINO_LIBS =
    include /usr/share/arduino/Arduino.mk

### Posting data to web server.

    #!/usr/bin/python
    import time
    from time import localtime
    import httplib, urllib
    import serial
    ser = serial.Serial('/dev/ttyACM0', 9600)

    while 1:
        time_now = localtime()
        hour = time_now.tm_hour
        minute = time_now.tm_min
        second = time_now.tm_sec
        string = str(hour) + ":" + str(minute) + ":" + str(second) + ser.readline()
        
        headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/plain"}
        conn = httplib.HTTPConnection("ec2-your-server.compute-1.amazonaws.com:8000")
        conn.request("GET", "/test-page?name=" + string)
        response = conn.getresponse()
    #    print response.status, response.reason
        data = response.read()
        conn.close()
        
    #    print '%s'%(string)
        time.sleep(25)

## Arduino sketch for water pump control
Using the Relay Shield http://seeedstudio.com/wiki/Relay_Shield_V2.0

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

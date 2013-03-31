moist-berry
===========

Irrigation project with Arduino and Raspberry Pi
Inspired by http://cm.cdn.fm/fakeup/dow-make/cmweb/entry_assets/MAKE18_Garduino_brnd.pdf

## Setting up Raspberry Pi for Arduino
    sudo apt-get update
    sudo apt-get install arduino
    
## Accessing Arduino via Serial from Python    
http://pyserial.sourceforge.net/

    python setup.py install

http://playground.arduino.cc/interfacing/python

    import serial
    ser = serial.Serial('/dev/tty.usbserial', 9600)
    ser.readline()
    ser.write('5')
    

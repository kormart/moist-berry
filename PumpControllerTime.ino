/*
 Water pump control using Seeedstudio Relay Shield v2.0
 (c) Martin Korling, May 2013  
 */
#include <Time.h>

const int analogInPinMoist0 = A0; // Analog input pin to moisture sensor
const int analogInPinMoist1 = A1; // Analog input pin to moisture sensor
const int analogInPinTemp = A2;  // Analog input pin to potentiometer 
const int analogOutPin = 9; // Analog output pin that the LED is attached to
const int indicatorPin = 13; // the pin to use for indicator LED
const int level0Pin = 10; // the pin to use for level 
const int level1Pin = 11; // the pin to use for level 
const int relay1Pin = 7; // the pin to use for relay control
const int relay2Pin = 6; // the pin to use for relay control
const int pump0DelayTime = 25;
const int pump1StartHour = 0;
const int pump1StartMinute = 2;
const int pump1OnMinutes = 15;

int levelState0 = 0;  // value read from level switch 0
int levelState1 = 0;  // value read from level switch 1
int moist0Value = 0;  // value read from moist sensor 0
int moist1Value = 0;  // value read from moist sensor 1
int tempSenseValue = 0;  // value read from the temperature sensor
int tempValue = 0;  // transformed value from the temperature sensor
int outputValue = 0;  // value output to the PWM (analog out)
int currentHour = 0;
int currentMinute = 0;
int pump0StartTime = 0;
int pump1StartTime = 0;
int pump1Flag = 0;
int pump0On = 0;
int pump1On = 0;
int pump0DelayFlag = 0;
int pump0DiffTime = 0;

char mode = '7';

void setup() {
  // initialize serial communications at 9600 bps:
  Serial.begin(9600); 
  // the pin to use for relay control
  pinMode(indicatorPin, OUTPUT);
  pinMode(relay1Pin, OUTPUT);
  pinMode(relay2Pin, OUTPUT);
  pinMode(level0Pin, INPUT);
  pinMode(level1Pin, INPUT);
}

void loop() {
  // read the analog values from sensors:
  moist0Value = analogRead(analogInPinMoist0);
  moist1Value = analogRead(analogInPinMoist1);
  tempSenseValue = analogRead(analogInPinTemp);
  // map it to the range of the analog out:
  tempValue = map(tempSenseValue, 300, 500, 5, 24);  
  // change the analog out value:
  // analogWrite(analogOutPin, outputValue);           

  if (Serial.available() > 0) {
    mode = (char)Serial.read();
  }

  // print time to serial
  Serial.print(hour());
  Serial.print(".");
  Serial.print(minute());
  Serial.print(".");
  Serial.print(now());
  Serial.print(":");

  // print the results to the serial monitor:
  Serial.print(moist0Value);
  Serial.print(":");      
  Serial.print(moist1Value);
  Serial.print(":");      
  Serial.print(tempValue);   
  Serial.print(":");      
  Serial.print(mode);   
  Serial.println(":r0.5");

  // Control block for Pump 0
/*  pump0On = 0;
  levelState0 = digitalRead(level0Pin);
  digitalWrite(indicatorPin, levelState0);
  if (levelState0 == 0) {
        pump0DelayFlag = 1;
  }
  if (levelState0 && pump0DelayFlag) {
        pump0DelayFlag = 0;
        pump0StartTime = now();
  }
  pump0DiffTime = now() - pump0StartTime;
  if (pump0DiffTime > pump0DelayTime && pump0DelayFlag==0) {
        pump0On = 1;
  }
  digitalWrite(relay1Pin, pump0On);
*/

  // Control blocks for Pump 1

  // Version 1: Turn on Pump 1 once per day
  if (mode == '5') {
    pump1On = 0;
    currentHour = hour();
    currentMinute = minute();
    if (currentHour == pump1StartHour) {
      if (currentMinute >= pump1StartMinute) {
        if (currentMinute < pump1StartMinute + pump1OnMinutes) {
          pump1On = 1;
        }
      }
    }
    digitalWrite(relay1Pin, pump1On);
  }

  // Version 2: Turn on Pump 1 for 1 minute every 10 minutes
  if (mode == '6') {
    pump1On = 0;
    currentMinute = minute();
    if ((currentMinute >= 00 && currentMinute < 01) || (currentMinute >= 10 && currentMinute < 11) || (currentMinute >= 20 && currentMinute < 21) || (currentMinute >= 30 && currentMinute < 31) || (currentMinute >= 40 && currentMinute < 41) || (currentMinute >= 50 && currentMinute < 51) ) {
      pump1On = 1;
    }
    digitalWrite(relay1Pin, pump1On);
  }

  // Version 3: Toggle Pump 1 using Level 1 switch
  if (mode == '7') {
    levelState1 = digitalRead(level1Pin);
    pump1On = 0;
    if (levelState1) {
      pump1Flag = ! pump1Flag;
    }
    if ( pump1Flag ) {
      pump1On = 1;
    }
    digitalWrite(relay1Pin, pump1On);
  // Quick fix by changing from relay2Pin above to control Pump 0 instead
  }

  // wait a while
  delay(500);   
}

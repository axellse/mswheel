# LEGO type:standard slot:0 autostart

# Imports & constants
import mindstorms # "Help Center" in mindstorms app
import hub # https://lego.github.io/MINDSTORMS-Robot-Inventor-hub-API/
import json
import math
import time

MSHub = mindstorms.MSHub()

returnTickRate = 3 # in seconds
mainMotor = hub.port.A.motor
accelerationColorSensor = hub.port.D.device
MSColorSensor = mindstorms.ColorSensor('D')

# Establish usb connection
usbStream = hub.BT_VCP(0)  # Ensure correct class reference
#usbStream.init(flow=usbStream.CTS)

# Helpers
def mapNum(num, inMin, inMax, outMin, outMax):
  return outMin + (float(num - inMin) / float(inMax - inMin) * (outMax
                  - outMin))

def correctedMove(pos):
    while mainMotor.get(0)[2] < pos + 4 & mainMotor.get(0)[2] > pos - 4:
        mainMotor.run_for_time(50, mapNum(pos, 0, 360, 0, 100))

# Init motors
time.sleep(0.5)
mainMotor.preset(mainMotor.get(0)[2] * 0.6)

# Init UI


def btButton(bla) :
    if (bla == 0): return
    if (hub.button.center.is_pressed() == True) :
        hub.repl_restart(True)
    else :
        hub.power.off()

lastMovement = mainMotor.get(0)[1]
def isTickTime():
    return round(hub.info()['1ms_tick_total'] / 100) % returnTickRate == 0

def isMoving():
    lastPos = mainMotor.get(0)[1]
    time.sleep(0.1)
    if (mainMotor.get(0)[1] - lastPos < 3 or mainMotor.get(0)[1] - lastPos > 3):
        return False
isReturning = False
def simulatePositionReturn():
    #global isReturning
    #if (isReturning): return
    #global lastMovement
    #if (mainMotor.get(0)[1] > lastMovement - 12 & mainMotor.get(0)[1] < lastMovement + 12):
    #    if (isMoving()): return
    #    speed = -100 if mainMotor.get(0)[1] > 0 else 100
    #    isReturning = True
    #    mainMotor.run_for_degrees(-mainMotor.get(0)[1], stall=True, speed=speed, stop=0)
    #    isReturning = False
    lastMovement = mainMotor.get(0)[1]
while True:
    accel = "none"
    hub.led(0, 0, 0)
    if (accelerationColorSensor.get(0)[1] == 5):
        hub.led(0, 255, 0)
        accel = "forward"
    elif (accelerationColorSensor.get(0)[1] == 9):
        hub.led(255, 0, 0)
        accel = "backward"

    if (abs(mainMotor.get(0)[1]) > 420):
        MSHub.speaker
        hub.led(255, 0, 0)
        hub.sound.beep(1000, 100)
    elif (mainMotor.get(0)[1] < 6 and mainMotor.get(0)[1] > -6):
        hub.led(255, 0, 255)
    if (isTickTime()):
        simulatePositionReturn()
    dataObject = json.dumps({
        'movement' : str(mainMotor.get(0)[1] * 0.6),
        'acceleration': accel,
        'tick' : str(round(hub.info()['1ms_tick_total'] / 100))
    })
    rawData = bytes("\n" + dataObject + "\n", 'utf-8')
    usbStream.write(rawData) 


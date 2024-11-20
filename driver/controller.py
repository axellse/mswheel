import vgamepad as vg
import time
import fileinput
import json
gamepad = vg.VX360Gamepad()


# press a button to wake the device up
gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_A)
gamepad.update()
time.sleep(0.5)
gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_A)
gamepad.update()
time.sleep(0.5)

while (True):
    inputQuery = json.loads(input())
    gamepad.reset()
    gamepad.left_joystick_float(x_value_float=inputQuery['x'], y_value_float=0)
    gamepad.right_trigger_float(value_float=inputQuery['forward'])
    gamepad.left_trigger_float(value_float=inputQuery['backward'])
    gamepad.update()
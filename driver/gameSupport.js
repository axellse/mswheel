import robot from '@hurdlegroup/robotjs'
import { exec } from 'child_process'

const mapNumRange = (num, inMin, inMax, outMin, outMax) =>
    ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
let globalUiCallback

let position = 0
let pressedKey = null
let ticksSinceAction = 0
let lastAccKey = "none"

let _accelerationDirection = 'none'
let _acceleration = 0
let xboxProcess

export const gameSupportModes = {
    'modulatedKeypress' : {
        'config' : {
            'forward' : "w",
            'backward' : "s",
            'left' : "a",
            'right' : "d",
            'sensitivity' : 0.6,
        },
        'calledCount' : 0,
        'begin' : async () => {
            while (true) {
                ticksSinceAction += 1
                if (pressedKey && ticksSinceAction > 5) {
                    robot.keyToggle(pressedKey, 'up')
                    pressedKey = null
                    continue
                }
                if (Math.abs(position) > 5) {
                    let key = position > 0 ? gameSupportModes.modulatedKeypress.config.right : gameSupportModes.modulatedKeypress.config.left
                    let pressTime = mapNumRange(Math.abs(position) * gameSupportModes.modulatedKeypress.config.sensitivity, 0, 170, 50, 0)

                    if (ticksSinceAction >= pressTime) {
                        console.log('pressing', key)
                        if (pressTime < 0) {
                            pressTime = 0
                        } else {
                            pressTime = Math.round(pressTime)
                        }
                        robot.keyToggle(key, 'down')
                        pressedKey = key
                        ticksSinceAction = 0
                    } else {
                        console.log(pressTime - ticksSinceAction)

                    }
                }
            }
        },
        'act' : async (newPos, newAcceleration) => {
            position = newPos

            if (newAcceleration == 'forward' && lastAccKey != 'forward') {
                robot.keyToggle(gameSupportModes.modulatedKeypress.config.forward, 'down')
                robot.keyToggle(gameSupportModes.modulatedKeypress.config.backward, 'up')
                lastAccKey = 'forward'
            } else if (newAcceleration == 'backward' && lastAccKey != 'backward') {
                robot.keyToggle(gameSupportModes.modulatedKeypress.config.backward, 'up')
                robot.keyToggle(gameSupportModes.modulatedKeypress.config.backward, 'down')
                lastAccKey = 'backward'
            } else if (newAcceleration == 'none' && lastAccKey != 'none') {
                robot.keyToggle(gameSupportModes.modulatedKeypress.config.forward, 'up')
                robot.keyToggle(gameSupportModes.modulatedKeypress.config.backward, 'up')
                lastAccKey = 'none'
            }
        }
    },
    'xboxController' : {
        'config' : {
            'steeringAngle' : 420,
            'accelerationMode' : 'trigger',
            'accelerationInterval' : 25
        },
        'calledCount' : 0,
        'begin' : async (uiCallback) => {
            globalUiCallback = uiCallback
            xboxProcess = exec('python controller.py', (err, stdout, stderr) => {
                console.log(stdout)
                console.log(stderr)
            })
            setInterval(() => {
                if (
                    (
                        _accelerationDirection == 'forward' && _acceleration < 1
                    )
                    ||
                    (
                        _accelerationDirection == 'backward' && _acceleration > -1
                    )
                    ||
                    (
                        gameSupportModes.xboxController.config.accelerationMode == 'trigger' &&
                        _accelerationDirection == 'none' && 
                        _acceleration != 0
                    )
                )
                {
                    _acceleration = Math.round(
                        (_acceleration + ((_accelerationDirection == 'forward' || (_acceleration < 0 && _accelerationDirection == 'none')) ? 0.05 : -0.05)) * 100
                    ) / 100
                }
            }, gameSupportModes.xboxController.config.accelerationInterval)
            globalUiCallback({
                'type' : 'ok',
                'message' : 'Initalized virtual Xbox controller with acceleration mode: ' + gameSupportModes.xboxController.config.accelerationMode
            }, 'game support')
        },
        'act' : async (newPos, newAcceleration) => {
            let val = mapNumRange(newPos, -gameSupportModes.xboxController.config.steeringAngle, gameSupportModes.xboxController.config.steeringAngle, -1, 1)
            if (Math.abs(val) > 1) {
                val = val > 0 ? 1 : -1
                globalUiCallback({
                    'type' : 'warn',
                    'message' : 'Oversteer, please avoid turning the wheel more in the respective position'
                }, 'game support')
            }

            _accelerationDirection = newAcceleration
            if (gameSupportModes.xboxController.config.accelerationMode == 'slider') {
                globalUiCallback({
                    'type' : 'ok',
                    'message' : 'Slider now at: ' + _acceleration
                }, 'game support')
            }
            xboxProcess.stdin.write(JSON.stringify({
                'x' : val,
                'forward' : _acceleration > 0 ? Math.abs(_acceleration) : 0,
                'backward' : _acceleration < 0 ? Math.abs(_acceleration) : 0,
            }) + '\n')
        }
    }
}
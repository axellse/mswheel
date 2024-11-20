import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'

export class Driver {
    dispose = () => {
        this.interface.close()
    }
    get available() {
        return this.interface.isOpen
    }
    uiCallback = null
    position = null
    positionCallback = null
    constructor(port, baudrate, posCb, uiCb) {
        this.positionCallback = posCb
        this.uiCallback = uiCb

        this.interface = new SerialPort({
            path: port, 
            baudRate : baudrate
        }, (err) => {
            if (err) {
                this.uiCallback({
                    'type': 'error',
                    'message': 'Could not connect to the wheel: ' + err.message
                }, 'driver')
                return false
            }
        })
        this.uiCallback({
            'type': 'ok',
            'message': 'Connected to wheel'
        }, 'driver')

        this.parser = this.interface.pipe(new ReadlineParser({ delimiter: '\n' }))
        this.parser.on('data', (data) => {
            let parsedData
            try {
                parsedData = JSON.parse(data)
            } catch (e) {
                return
            }

            if (parsedData['movement']) {
                this.position = -JSON.parse(parsedData['movement'])
                this.acceleration = parsedData['acceleration']

                if (this.positionCallback) {
                    this.positionCallback(this.position, this.acceleration)
                }
            }
        })
        this.interface.on('error', (err) => {
            this.uiCallback({
                'type': 'error',
                'message': 'Could not communicate with wheel: ' + err.message
            }, 'driver')
        })
        return true
    }
}

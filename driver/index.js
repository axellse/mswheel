import { Driver } from "./driver.js"
import { gameSupportModes } from "./gameSupport.js" 

const messageTypes = {
    'ok' : {
        'displayName' : 'OK',
        'colorCode' : '\x1b[38;2;13;188;121m'
    },
    'error' : {
        'displayName' : 'ERROR',
        'colorCode' : '\x1b[38;2;203;89;89m'
    },
    'warn' : {
        'displayName' : 'WARNING',
        'colorCode' : '\x1b[38;2;231;245;67m'
    }
}

function handleOutput(message, source) {
    let _type = messageTypes[message.type]
    console.log(`${message.message} (${source}) [${_type.colorCode + _type.displayName + '\x1b[0m'}]`)
}

new Driver('COM6', 115200, (pos, acceleration) => {
    gameSupportModes.xboxController.act(pos, acceleration)
}, handleOutput)
gameSupportModes.xboxController.begin(handleOutput)
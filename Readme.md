# MSWheel
This is a fully functional steering wheel for use with pc, built with the lego mindstorms 515151 set.

# Getting started
1. First of all, flash the code to the lego hub. Open 'main.py' in vsc (with [this extension](https://marketplace.visualstudio.com/items?itemName=PeterStaev.lego-spikeprime-mindstorms-vscode)), and press the flash icon in the top right.

2. After that, its time to setup the driver. First make sure you have node.js and python installed, then run 'npm install' and 'pip install vgamepad' in the driver directory.

3. Connect to the mindstorms hub via bluetooth, and use device manager to find the com port (under "ports (com and lpt)") that correspond to the hub. Then change the code to that port.

# Other info
This project:
* Emulates an xbox controller for input.
* Has no force feedback functionality.
* Has no other than basic functionality.
* Requires windows aswell as a pc/laptop with bluetooth.
* Is very early in development so very shitty.
* So early in development i haven't uploaded build instructions, just throw something together yourself, im sure it will be fine (thats what this project is anyways).

Tip: dont use the "modulated keypress" mode. it's actually horrendous👍.

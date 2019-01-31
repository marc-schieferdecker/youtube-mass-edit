#!/bin/bash

SCREEN="/usr/bin/screen"
NODE="/usr/bin/nodemon"
HOMEPATH="/home/ytmassedit"
SCREENWINDOW="ytmassedit"

# Changedir
cd $HOMEPATH

$SCREEN -S $SCREENWINDOW -X quit
$SCREEN -dmS $SCREENWINDOW $NODE bin/www --config nodemon.json

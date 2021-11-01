#!/bin/bash

REPS=0
STATE=off

while [ $REPS -le 12 ]
do
    #/usr/bin/python /home/messyfresh/twitch_projects/wemo_control/client.py --device 192.168.10.30 --$STATE
    /home/messyfresh/twitch_playground/wemo_control.sh $STATE
    REPS=$((REPS+1))
    if [ $STATE == "off" ]
    then
        STATE=on
    else
        STATE=off
    fi
    sleep 0.5
done

/usr/bin/python /home/messyfresh/twitch_playground/wemo_control/client.py --device 192.168.10.30 --on
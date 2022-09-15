#!/bin/sh
sudo setcap CAP_NET_BIND_SERVICE=+eip /usr/bin/node
sudo cp sms-miniwallet-server.service /etc/systemd/system/sms-miniwallet-server.service
sudo systemctl start sms-miniwallet-server
sudo systemctl enable sms-miniwallet-server
systemctl status sms-miniwallet-server

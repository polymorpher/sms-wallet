#!/bin/sh
sudo setcap CAP_NET_BIND_SERVICE=+eip /usr/bin/node
sudo cp sms-wallet-server.service /etc/systemd/system/sms-wallet-server.service
sudo systemctl start sms-wallet-server
sudo systemctl enable sms-wallet-server
systemctl status sms-wallet-server

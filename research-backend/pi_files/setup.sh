#!/bin/bash

set -e
USERNAME=$(echo $USER)

sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip dos2unix

sudo at pip3 install numpy Picamera2 cv time datetime numpy base64 Flask

SERVER_SCRIPT="/home/$USERNAME/server/main.py"

dos2unix "$SERVER_SCRIPT"

echo "Creating systemd service to run server.py on boot..."

SERVICE_FILE="/etc/systemd/system/server.service"
sudo bash -c "cat > $SERVICE_FILE" <<EOF
[Unit]
Description=Flask Server
After=network.target

[Service]
ExecStart=/usr/bin/python3 $SERVER_SCRIPT
WorkingDirectory=/home/$USERNAME/server
StandardOutput=inherit
StandardError=inherit
Restart=always
User=$USERNAME

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable server.service
sudo systemctl start server.service

reboot
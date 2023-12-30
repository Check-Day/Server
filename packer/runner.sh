#!/bin/bash

sudo apt-get -y upgrade
sudo apt-get install unzip
unzip server.zip
sudo apt update
sudo DEBIAN_FRONTEND=noninteractive apt -y upgrade
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
sudo apt update
sudo DEBIAN_FRONTEND=noninteractive apt install -y mysql-server
sudo mysql -e "
CREATE DATABASE ${DATABASE_NAME};
ALTER USER '${DATABASE_USERNAME}'@'${DATABASE_HOST}' IDENTIFIED WITH mysql_native_password BY '${DATABASE_PASSWORD}';
"
sudo systemctl start mysql.service

sudo cat <<EOF | sudo tee /etc/systemd/system/server.service
[Unit]
Description=index.js
Documentation=https://checkday.app/
Wants=network-online.target
After=network-online.target cloud-final.service

[Service]
EnvironmentFile=/home/ubuntu/.env
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/
ExecStart=/usr/bin/node /home/ubuntu/index.js
Restart=on-failure

[Install]
WantedBy=cloud-init.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable server.service
sudo systemctl start server.service
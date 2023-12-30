#!/bin/bash
source ~/.bashrc
sudo apt-get -y upgrade
sudo apt-get install unzip
unzip server.zip
sudo apt update
sudo DEBIAN_FRONTEND=noninteractive apt-get -y upgrade
sudo apt-get install -y curl
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
sudo apt update
cd ~/server/
sudo npm install
cd ..
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server
sudo mysql <<SQL
CREATE DATABASE $DATABASE_NAME;
ALTER USER '$DATABASE_USERNAME'@'$DATABASE_HOST' IDENTIFIED WITH mysql_native_password BY '$DATABASE_PASSWORD';
FLUSH PRIVILEGES;
SQL
sudo systemctl start mysql.service

# sudo cat <<EOF | sudo tee /etc/systemd/system/server.service
# [Unit]
# Description=index.js
# Documentation=https://checkday.app/
# Wants=network-online.target
# After=network-online.target cloud-final.service
# [Service]
# EnvironmentFile=/home/ubuntu/server/.env
# Type=simple
# User=ubuntu
# WorkingDirectory=/home/ubuntu/server
# ExecStart=/usr/bin/node /home/ubuntu/server/index.js
# Restart=on-failure
# [Install]
# WantedBy=cloud-init.target
# EOF
# sudo systemctl daemon-reload
# sudo systemctl enable server.service
# sudo systemctl start server.service
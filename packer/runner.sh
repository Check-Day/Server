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
sudo npm install
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server
sudo mysql <<SQL
CREATE DATABASE $DATABASE_NAME;
ALTER USER '$DATABASE_USERNAME'@'$DATABASE_HOST' IDENTIFIED WITH mysql_native_password BY '$DATABASE_PASSWORD';
FLUSH PRIVILEGES;
SQL
sudo systemctl start mysql.service
sudo apt-get update
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
aws configure set aws_access_key_id $ACCESS_KEY
aws configure set aws_secret_access_key $SECRET_KEY
aws configure set default.region $AWS_REGION
sudo cat <<EOF | sudo tee /etc/systemd/system/checkday.service
[Unit]
Description=index.js
Documentation=https://checkday.app/
Wants=network-online.target
After=network-online.target cloud-final.service
[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu
ExecStart=/usr/bin/node /home/ubuntu/index.js
Restart=on-failure
[Install]
WantedBy=cloud-init.target
EOF
sudo systemctl daemon-reload
sudo systemctl enable checkday.service
sudo systemctl start checkday.service
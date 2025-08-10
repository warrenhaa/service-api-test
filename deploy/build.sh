#!/bin/bash

#sudo systemctl start service-api
/usr/local/bin/docker-compose -f /home/ec2-user/service-api/service-api/docker-compose.yml up -d
sleep 30
/usr/bin/docker exec $(docker ps -aqf "name=service-api_app_1") npm run migrate
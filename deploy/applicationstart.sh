#!/bin/bash

sudo /usr/local/bin/docker-compose -f /home/ec2-user/service-api/service-api/docker-compose.yml up -d >> /opt/deployment/deploy.log
sudo sleep 30
sudo /usr/bin/docker exec $(docker ps -aqf "name=service-api_app_1") npm run migrate >> /opt/deployment/deploy.log
d=`date`
echo "$d : starting" >> /opt/deployment/deploy.log
d=`date`
echo "$d : exiting stage 5 complete" >> /opt/deployment/deploy.log

exit 0

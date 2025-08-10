#!/bin/bash

#Stopping application
#sudo systemctl stop service-api
/usr/local/bin/docker-compose -f /home/ec2-user/service-api/service-api/docker-compose.yml down

#/usr/bin/docker rm -vf $(docker ps -a -q)
/usr/bin/docker rmi -f $(docker images -a -q)

# Delete the old repo
rm -rf /home/ec2-user/service-api

#Create new dir
mkdir /home/ec2-user/service-api




FROM node:14-alpine

# Create app directory
WORKDIR /usr/src/app
ENV NODE_OPTIONS=--max-old-space-size=1400
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production
RUN npm install @babel/cli -g
RUN npm install @babel/core -g
RUN npm i -g sequelize-cli
RUN npm install -g pg
# Bundle app source

COPY . .
ENTRYPOINT ["/bin/sh", "./entrypoint.sh"]

EXPOSE 8000

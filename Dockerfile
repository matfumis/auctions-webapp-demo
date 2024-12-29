FROM node:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN npm install -g nodemon
COPY ./app/package*.json /usr/src/app
RUN npm install
COPY ./app /usr/src/app
EXPOSE 3000

RUN ls -l /usr/src/app
RUN cat /usr/src/app/package.json
RUN npm list
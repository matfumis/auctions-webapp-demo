FROM node:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./app/package*.json /usr/src/app
RUN npm install -g nodemon
RUN npm install
COPY ./app /usr/src/app
EXPOSE 3000


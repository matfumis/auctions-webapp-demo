FROM node:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN npm install -g nodemon
COPY ./app/package.json /usr/src/app
COPY ./app/package-lock.json /usr/src/app/
RUN npm install
COPY ./app /usr/src/app
EXPOSE 3000
CMD ["nodemon", "--watch", "/usr/src/app", "-e", "js", "app.js"]
FROM node:14

WORKDIR /usr/src
COPY . .

EXPOSE 8080
CMD [ "npm", "run", "start" ]
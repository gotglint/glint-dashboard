FROM node

RUN npm install -g forever

WORKDIR /opt/glint
RUN npm install

CMD forever ./server.es6

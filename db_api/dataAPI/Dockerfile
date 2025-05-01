FROM node:18

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY server.js ./

EXPOSE 3018

CMD ["npm", "run", "dev"]
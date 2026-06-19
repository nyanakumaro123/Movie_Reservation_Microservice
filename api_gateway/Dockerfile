FROM node:22-alpine

WORKDIR /api

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 8080

CMD ["node", "index.js"]
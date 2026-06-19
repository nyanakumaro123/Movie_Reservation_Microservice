FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN chmod -R +x /app/node_modules/.bin

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
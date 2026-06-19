FROM node:20-alpine

WORKDIR /app

COPY package.json .

RUN npm install --omit=dev

COPY . .

# Beri izin eksekusi ke entrypoint
RUN chmod +x entrypoint.sh

EXPOSE 9000

CMD ["sh", "entrypoint.sh"]
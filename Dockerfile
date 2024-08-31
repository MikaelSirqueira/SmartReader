FROM node:20.11

WORKDIR /app

RUN rm -rf ./node_modules

COPY package*.json ./

COPY . .

EXPOSE 3333

RUN npm install

RUN npx prisma generate

RUN npm run build

CMD ["npm", "run", "start"]
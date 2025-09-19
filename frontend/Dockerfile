FROM node:18-alpine AS build

WORKDIR /app

COPY frontend .

RUN npm install

RUN npm run build

RUN npm install -g serve

EXPOSE 80
CMD ["serve", "-s", "dist", "-l", "80"]
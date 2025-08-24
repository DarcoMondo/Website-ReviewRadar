FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Set environment variable to disable host check
ENV WDS_SOCKET_HOST=localhost
ENV WDS_SOCKET_PORT=3000

CMD ["npm", "start"]

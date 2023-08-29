FROM ubuntu:20.04

RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash && apt-get install -y nodejs

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
RUN npx playwright install --with-deps chromium

COPY . .

CMD ["node", "index.js"]
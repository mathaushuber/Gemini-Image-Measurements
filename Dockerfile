FROM node:18.15.0

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Netcat é necessário para testar a conexão do banco de dados
RUN apt-get update && apt-get install -y netcat

EXPOSE 80

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
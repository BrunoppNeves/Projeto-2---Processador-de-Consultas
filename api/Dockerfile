# Use uma imagem base do Node.js
FROM node:20.9.0

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /home/node/app

# Copie os arquivos do seu aplicativo para o contêiner
COPY . .

# Instale as dependências do npm
RUN npm install

# Exponha a porta que sua aplicação estará ouvindo
EXPOSE 8080

# Comando para iniciar sua aplicação com ts-node-dev quando o contêiner for iniciado
CMD ["npx", "ts-node-dev", "./app.ts"]

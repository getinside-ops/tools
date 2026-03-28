FROM node:20-alpine

# Install Ghostscript
RUN apk add --no-cache ghostscript

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production
COPY server.js ./

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]

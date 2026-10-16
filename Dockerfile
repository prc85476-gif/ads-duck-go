FROM node:20-alpine

WORKDIR /app

# Copy root and client package definitions
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN npm --prefix client install

# Copy application source
COPY . .

# Build frontend production bundle
RUN npm --prefix client run build

# Expose server port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Start server (which serves API + built frontend static files)
CMD ["node", "server.js"]

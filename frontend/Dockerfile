FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy public directory first
COPY public/ ./public/

# Copy source code
COPY src/ ./src/

# Copy other necessary files
COPY *.js *.json ./

# Verify public directory exists and contains index.html
RUN ls -la /app/public/ && test -f /app/public/index.html

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
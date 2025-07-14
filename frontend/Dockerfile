FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code including public directory
COPY . .

# List contents to debug
RUN ls -la /app/
RUN ls -la /app/public/ || echo "No public directory found"

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create public directory if it doesn't exist
RUN mkdir -p /app/public

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
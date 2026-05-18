# Use a lightweight Node.js image suitable for production
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Install openssl which is required for Prisma on Alpine Linux
RUN apk add --no-cache openssl

# Copy package.json and package-lock.json first to leverage Docker layer caching
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate the Prisma client
RUN npx prisma generate

# Expose the port the backend app runs on
EXPOSE 5000

# Set environment variables with safe defaults
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["npm", "start"]

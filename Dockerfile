# Stage 1: Build dependencies
FROM node:18 AS build-deps

# Set working directory inside the container for the build stage
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Stage 2: Final image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy the dependencies from the build stage
COPY --from=build-deps /app/node_modules /app/node_modules

# Copy the rest of the application files
COPY . .

# Expose port 5000 (or your API port)
EXPOSE 5000

# Start the server
CMD ["npm", "run", "dev"]

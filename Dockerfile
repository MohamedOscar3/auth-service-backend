FROM node:18-alpine

# Set NODE_ENV
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Skip husky installation in CI environment
ENV HUSKY=0

# Install only production dependencies
RUN npm ci --omit=dev

# Copy app files
COPY . .



# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "dist/main"]

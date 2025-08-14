FROM node:18-alpine AS development

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Build the app
RUN npm run build

FROM node:18-alpine AS production

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
RUN npm ci --only=production

# Copy built app from development stage
COPY --from=development /usr/src/app/dist ./dist



# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "dist/main"]

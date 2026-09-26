FROM node:20-alpine

WORKDIR /app

# Install dependencies first for caching
COPY package.json package-lock.json* ./
RUN npm install

# Copy all files
COPY . .

# Next.js disables telemetry by default during build if set
ENV NEXT_TELEMETRY_DISABLED 1

EXPOSE 3000

# Run in development mode to allow hot-reloading with volume mounts
CMD ["npm", "run", "dev"]

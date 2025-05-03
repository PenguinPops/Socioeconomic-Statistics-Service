FROM node:18

WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json eslint.config.mjs jsconfig.json next.config.mjs postcss.config.mjs ./

# Copy the entire src directory
COPY src ./src

# Copy the public directory
COPY public ./public

RUN npm install --legacy-peer-deps

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]
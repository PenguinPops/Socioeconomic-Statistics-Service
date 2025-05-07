FROM node:18

WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json eslint.config.mjs jsconfig.json next.config.mjs postcss.config.mjs auth.ts next-env.d.ts tsconfig.json ./

COPY src ./src

COPY public ./public

RUN npm install --legacy-peer-deps

# Create env file
RUN npx auth secret

EXPOSE 3000

CMD ["npm", "run", "dev"]
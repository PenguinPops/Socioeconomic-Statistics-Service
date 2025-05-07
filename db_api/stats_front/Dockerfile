FROM node:18

WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json eslint.config.mjs jsconfig.json next.config.mjs postcss.config.mjs auth.ts next-env.d.ts tsconfig.json db.ts ./

COPY src ./src

COPY public ./public

COPY docker-entrypoint.sh /usr/local/bin/

RUN npm install --legacy-peer-deps && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]
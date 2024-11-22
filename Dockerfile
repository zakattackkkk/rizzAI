FROM node:23.1.0
# Install pnpm globally
RUN npm install -g pnpm@9.4.0

# Set the working directory
WORKDIR /app

# Add configuration files and install dependencies
ADD pnpm-workspace.yaml /app/pnpm-workspace.yaml
ADD package.json /app/package.json
ADD .npmrc /app/.npmrc
ADD tsconfig.json /app/tsconfig.json
ADD pnpm-lock.yaml /app/pnpm-lock.yaml
RUN pnpm i

# Add the documentation
ADD docs /app/docs
RUN pnpm i

# Add the rest of the application code
ADD packages /app/packages
ADD packages /app/agent
RUN pnpm i

# Add the environment variables
ADD scripts /app/scripts
ADD characters /app/characters
ADD .env /app/.env
ADD .env /app/agent/.env

RUN pnpm build

CMD ["pnpm", "start"]

# Command to run the container
# CMD ["tail", "-f", "/dev/null"]
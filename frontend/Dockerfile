FROM node:20-alpine
RUN npm install -g npm@latest

WORKDIR /app

# These COPY commands assume the build context is the project root.
COPY package*.json ./
COPY tsconfig.json ./
COPY tailwind.config.cjs ./

RUN npm install

# Copy the rest of the files needed for the frontend build.
# Adjust these paths according to your project structure.
COPY src/public /app/src/public
COPY frontend /app/frontend

# Build your assets (assuming your build script picks up the necessary files)
RUN npm run build

# Install a static server to serve your frontend
RUN npm install -g serve

RUN npx tsc

EXPOSE 8080

# Serve static files; adjust the path if your final build is elsewhere.
CMD ["serve", "-s", "src/public", "-l", "8080"]

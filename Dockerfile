FROM node:22.14.0-alpine

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

EXPOSE 4200

# Serve with host 0.0.0.0 for Docker access
CMD ["npm", "run", "start"]
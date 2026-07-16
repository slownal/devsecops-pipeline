# Build Stage
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
# Use --legacy-peer-deps to avoid issues with vite/react deps if any
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Serve Stage
FROM nginx:alpine
# Copy custom nginx conf if needed: COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

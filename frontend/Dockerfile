# Since frontend doesn't have source code in this snapshot yet, 
# we create a basic placeholder Dockerfile that serves a static index.html or builds if present.
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# If package.json exists, install and build
RUN if [ -f package.json ]; then npm install && npm run build; else mkdir -p dist/browser && echo "<h1>Frontend works</h1>" > dist/browser/index.html; fi

FROM nginx:alpine
COPY --from=builder /app/dist/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

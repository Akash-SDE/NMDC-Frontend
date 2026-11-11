FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=https://iron-ore-backend-420604925540.asia-south1.run.app/api
ARG VITE_APP_ENV=production
ARG VITE_USE_MOCK_AUTH=false
ARG VITE_COCKPIT_ALLOW_DEMO=false

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_ENV=$VITE_APP_ENV
ENV VITE_USE_MOCK_AUTH=$VITE_USE_MOCK_AUTH
ENV VITE_COCKPIT_ALLOW_DEMO=$VITE_COCKPIT_ALLOW_DEMO

RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

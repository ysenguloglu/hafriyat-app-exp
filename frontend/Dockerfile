FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# Build sırasında VITE_API_BASE_URL'i inject et
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist

EXPOSE 4173
ENV PORT=4173
CMD ["sh", "-c", "npm run start"]


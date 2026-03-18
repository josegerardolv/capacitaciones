FROM node:20.18-alpine AS builder

# Instalar pnpm directamente
RUN npm install -g pnpm@9

WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar TODAS las dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Compilar NestJS
RUN pnpm build


FROM node:20.18-alpine

# Instalar pnpm en runtime
RUN npm install -g pnpm@9

WORKDIR /usr/src/app
ENV NODE_ENV=production

# 1. Crear usuario y carpetas al inicio de esta etapa (Mejor para la caché) 
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    mkdir -p /usr/src/app/uploads && \
    chown -R appuser:appgroup /usr/src/app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
    
# 2. Copiar el build (Asegurando que el dueño sea appuser al copiar)
COPY --from=builder --chown=appuser:appgroup /usr/src/app/dist ./dist

# 3. Cambiar el dueño de lo que acabas de instalar vía pnpm
RUN chown -R appuser:appgroup /usr/src/app

USER appuser
EXPOSE 3000
CMD ["node", "dist/main.js"]
    # =================================================================
    # ETAPA 1: Compilación de la aplicación de Angular
    # =================================================================
    # Usamos una imagen oficial de Node.js como base.
    # Se recomienda usar una versión LTS (Long-Term Support) específica.
    # Tu proyecto requiere node >=18.13.0, por lo que node:20 es una excelente opción.
    FROM node:20-slim AS build

    # Establecemos el directorio de trabajo dentro del contenedor.
    WORKDIR /app

    # Copiamos los archivos de definición de dependencias.
    # Al copiarlos primero, aprovechamos el caché de Docker si no han cambiado.
    COPY package.json package-lock.json ./

    # Instalamos las dependencias del proyecto.
    RUN npm ci

    # Copiamos el resto de los archivos del proyecto al contenedor.
    COPY . .

    # Compilamos la aplicación para producción.
    # El resultado se guardará en el directorio /app/dist/semovi-frontend
    RUN npm run build:prod

    # =================================================================
    # ETAPA 2: Servidor web para producción (Nginx)
    # =================================================================
    # Usamos una imagen oficial y ligera de Nginx.
    FROM nginx:1.25-alpine

    # Copiamos nuestra configuracións personalizada de Nginx.
    COPY nginx.conf /etc/nginx/conf.d/default.conf

    # Copiamos los archivos compilados de la aplicación desde la etapa de 'build'.
    # La ruta de salida es `dist/capa-frontend` según angular.json, y los archivos
    # para el navegador se encuentran en el subdirectorio 'browser'.
    COPY --from=build /app/dist/capa-frontend/browser /usr/share/nginx/html

    # Exponemos el puerto 80 para que el contenedor pueda recibir peticiones HTTP.
    EXPOSE 80

    # Comando para iniciar Nginx cuando el contenedor se inicie.
    CMD ["nginx", "-g", "daemon off;"]
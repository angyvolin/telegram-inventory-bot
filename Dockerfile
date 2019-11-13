FROM node:12.11.0

# Папка приложения
ARG APP_DIR=/var/www/telegram-inventory-bot
RUN mkdir -p ${APP_DIR}
WORKDIR ${APP_DIR}

# Установка зависимостей
COPY package*.json ./
RUN npm install

# Копирование файлов проекта
COPY . .

# Установка зависимостей
RUN npm install --production

# Запуск проекта
CMD ["npm", "run", "prod"]
# PHP Бэкенд для Pseudomonas

Этот проект представляет собой миграцию бэкенда с NestJS на PHP, сохраняя тот же функционал.

## Требования

- PHP 7.4+ (рекомендуется PHP 8.0+)
- MySQL 5.7+
- Apache с поддержкой mod_rewrite или Nginx

## Установка

1. Скопируйте файлы в папку на вашем веб-сервере:

   ```
   git clone <repository-url> /path/to/webserver/pseudomonas
   ```

2. Убедитесь, что ваш веб-сервер настроен на обработку .htaccess файлов, или настройте соответствующие правила для Nginx.

3. Убедитесь, что файл .env доступен в директории backend/ с правильными параметрами подключения к БД:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=pseud
   DB_PASSWORD=12345678
   DB_DATABASE=pseud
   JWT_SECRET=pseudomonas-secret-key
   ```

## Структура проекта

- `index.php` - основной файл бэкенда, обрабатывающий все запросы API
- `.htaccess` - конфигурация Apache для маршрутизации запросов

## API Эндпоинты

Все запросы проходят через /api/...

### Аутентификация

- **POST /api/auth/login** - Авторизация пользователя

  ```json
  {
    "username": "your_username",
    "password": "your_password"
  }
  ```

- **GET /api/auth/check** - Проверка аутентификации

  ```
  Headers: Authorization: Bearer {token}
  ```

- **POST /api/auth/logout** - Выход пользователя
  ```
  Headers: Authorization: Bearer {token}
  ```

### Пользователи

- **GET /api/users/{id}** - Получение информации о пользователе
  ```
  Headers: Authorization: Bearer {token}
  ```

## Конфигурация Nginx (альтернатива Apache)

Если вы используете Nginx вместо Apache, добавьте следующую конфигурацию в ваш server блок:

```nginx
location / {
    try_files $uri $uri/ /index.php?$query_string;
}

location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php8.0-fpm.sock; # Путь к вашему сокету PHP-FPM
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}
```

## Безопасность

- Все пароли хранятся в зашифрованном виде
- Поддерживается JWT-аутентификация
- CORS настроен для безопасного взаимодействия с фронтендом

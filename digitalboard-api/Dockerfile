FROM php:8.2-fpm-alpine

RUN apk add --no-cache bash curl libzip-dev zip oniguruma-dev
RUN docker-php-ext-install pdo_mysql bcmath

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

EXPOSE 9000
CMD ["php-fpm"]

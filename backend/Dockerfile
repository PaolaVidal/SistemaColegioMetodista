FROM php:8.5-cli

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
    git \
    curl \
    libicu-dev \
    libpq-dev \
    libzip-dev \
    unzip \
    zip \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-configure pgsql -with-pgsql=/usr/local/include/postgresql \
    && docker-php-ext-install pdo_pgsql pgsql bcmath intl zip opcache \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && rm -rf /var/lib/apt/lists/* \
    && echo "opcache.enable_cli=1" > /usr/local/etc/php/conf.d/opcache-cli.ini

COPY . /var/www/html

# Las descargas desde GitHub a veces fallan de forma temporal (HTTP 5xx): se reintenta antes de fallar.
RUN for intento in 1 2 3; do \
      composer install --no-interaction --prefer-dist --no-progress && break; \
      echo "composer install falló (intento $intento); reintentando en 15 s..."; sleep 15; \
    done \
    && test -f vendor/autoload.php

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

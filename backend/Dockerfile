FROM php:8.2-cli

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
    && rm -rf /var/lib/apt/lists/*

COPY . /var/www/html

RUN composer install --no-interaction --prefer-dist --no-progress

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

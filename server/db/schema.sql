-- Создание таблицы products
CREATE TABLE IF NOT EXISTS products
(
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    image      VARCHAR(255) NOT NULL,
    price      DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Создание таблицы roles
CREATE TABLE IF NOT EXISTS roles
(
    id   SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
    );

-- Вставка данных в таблицу roles
INSERT INTO roles (name)
VALUES ('admin'),
       ('user')
    ON CONFLICT (name) DO NOTHING;


-- Создание таблицы users
CREATE TABLE IF NOT EXISTS users
(
    id       SERIAL PRIMARY KEY,
    email    VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role     VARCHAR (255) NOT NULL
    );

-- Создание таблицы user_roles
CREATE TABLE IF NOT EXISTS user_roles
(
    user_id INT REFERENCES users (id) ON DELETE CASCADE,
    role_id INT REFERENCES roles (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id),
    UNIQUE (user_id, role_id)  -- Уникальное ограничение на сочетание user_id и role_id
    );

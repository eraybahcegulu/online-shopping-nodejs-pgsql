# pg-express-rest-api

USED TECHNOLOGIES
- TypeScript
- NodeJS ExpressJS
- PostgreSQL
- Bootstrap
- GitHub


1. edit .env

```
DB_CONNECTION_STRING = postgresql://username:password@host:port/dbname[?paramspec]

e.g.
DB_CONNECTION_STRING = postgresql://postgres:1337@localhost:5432/app_database
```



2. Creating PostgreSQL tables
```
CREATE TABLE admins (
    id serial PRIMARY KEY,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    user_type character varying(255) COLLATE pg_catalog."default" NOT NULL
);

CREATE TABLE carts (
    id serial PRIMARY KEY,
    customer_id integer NOT NULL,
    products_id integer NOT NULL,
    products_type character varying(255) COLLATE pg_catalog."default" NOT NULL,
    products_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    products_price numeric(10,2) NOT NULL,
    products_description text COLLATE pg_catalog."default" NOT NULL
);

CREATE TABLE customers (
    id serial PRIMARY KEY,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    surname character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    user_type character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT customers_email_key UNIQUE (email)
);

CREATE TABLE orders (
    id serial PRIMARY KEY,
    customer_id integer NOT NULL,
    customer_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    customer_email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    order_amount numeric(10,2) NOT NULL,
    order_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id)
        REFERENCES public.customers (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

CREATE TABLE order_items (
    id serial PRIMARY KEY,
    order_id integer NOT NULL,
    products_id integer NOT NULL,
    products_type character varying(255) COLLATE pg_catalog."default" NOT NULL,
    products_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    products_price numeric(10,2) NOT NULL,
    products_description text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id)
        REFERENCES public.orders (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

CREATE TABLE product_types (
    id serial PRIMARY KEY,
    type character varying(50) COLLATE pg_catalog."default" NOT NULL
);

CREATE TABLE products (
    id serial PRIMARY KEY,
    type character varying(255) COLLATE pg_catalog."default" NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    price numeric(10,2) NOT NULL,
    description text COLLATE pg_catalog."default" NOT NULL
);

INSERT INTO admins (email, name, password, user_type)
VALUES ('admin@admin', 'admin', 'admin', 'admin');
```

1. Packages, build and dev

```
- npm install
- npm run build
- npm run dev
```

1. Login

- Email: admin@admin
- Password: admin
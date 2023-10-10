# pg-express-mvc-app

USED TECHNOLOGIES
- TypeScript
- NodeJS ExpressJS
- PostgreSQL
- EJS
- Bootstrap


1. Edit .env file

```
DB_CONNECTION_STRING = postgresql://your_username:your_password@localhost:port/your_database

```


2. Creating PostgreSQL tables
```
psql -h localhost -d your_database -U your_username -a -f create-tables.sql

```


3. Packages, build and dev

```
npm install
```

```
npm run build
```

```
npm run dev
```


4. Login

- Email: admin@admin
- Password: admin
# pg-express-rest-api

USED TECHNOLOGIES
- TypeScript
- NodeJS ExpressJS
- PostgreSQL
- EJS
- Bootstrap


1. Edit .env file

```
DB_CONNECTION_STRING = postgresql://username:password@host:port/dbname[?paramspec]

e.g.
DB_CONNECTION_STRING = postgresql://postgres:1337@localhost:5432/app_database
```



2. Creating PostgreSQL tables
```
psql -h localhost -d your_database -U your_username -a -f migrations/tables.sql

e.g
psql -h localhost -d app_database -U postgres -a -f migrations/tables.sql
```

3. Packages, build and dev

```
- npm install
- npm run build
- npm run dev
```

4. Login

- Email: admin@admin
- Password: admin
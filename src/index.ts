import express from 'express'
import postgresClient from '../config/db'
import path from 'path';
import session from 'express-session';

const app = express()

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    userEmail?: string;
    userName?: string;
  }
}

app.set('view engine', 'ejs');

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
const PORT = 5000;

app.use(express.static(path.join(__dirname, 'public/html')));
app.set('views', path.join(__dirname, 'public/views'));
app.use(express.static(path.join(__dirname, 'public/views')));

app.get('/customerAdd', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html', 'customerAdd.html'));
});

app.get('/productAdd', async (req, res) => {
  try {

    const result = await postgresClient.query('SELECT * FROM product_types');

    console.log('Result:', result.rows);
    res.render('productAdd', { productTypes: result.rows });
  } catch (error) {
    console.error('Error fetching product types:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html', 'login.html'));
});

app.get('/customerHome', (req, res) => {
  const urlUserId = req.query.user;
  
  if (req.session.userId && req.session.userId.toString() === urlUserId) {
    const user = {
      userName: req.session.userName,
      userEmail: req.session.userEmail
    };
    res.render('customerHome', { user });
  } else {
    res.redirect('/');
  }
});

app.get('/adminHome', (req, res) => {
  const urlAdminId = req.query.admin;
  
  if (req.session.userId && req.session.userId.toString() === urlAdminId) {
    const user = {
      userName: req.session.userName,
      userEmail: req.session.userEmail
    };
    res.render('adminHome', { user });
  } else {
    res.redirect('/');
  }
});

app.post('/customerAdd', async (req, res) => {
  const { name, surname, email, password } = req.body;

  try {
      console.log('INSERT INTO customers (name, surname, email, password, user_type) VALUES ($1, $2, $3, $4 , $5) RETURNING *', [name, surname, email, password, 'customer']);

      const result = await postgresClient.query(
          'INSERT INTO customers (name, surname, email, password, user_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [name, surname, email, password, 'customer']
      );

      console.log('Result:', result.rows);

      const newCustomer = result.rows[0];

      res.json({ newCustomer });
  } catch (error) {
      console.error('Error registering customer:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/productAdd', async (req, res) => {
  const { type, name, price, description } = req.body;

  try {
      console.log('INSERT INTO products (type, name, price, description) VALUES ($1, $2, $3, $4) RETURNING *', [type, name, price, description]);

      const result = await postgresClient.query(
          'INSERT INTO products (type, name, price, description) VALUES ($1, $2, $3, $4) RETURNING *',
          [type, name, price, description]
      );

      console.log('Result:', result.rows);

      const newProduct = result.rows[0];

      res.json({ newProduct });
  } catch (error) {
      console.error('Error registering customer:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;

    try {
      const result = await postgresClient.query(
        `SELECT id, name, email, user_type
        FROM (
            SELECT id, name, email, 'customer' AS user_type, password FROM customers
            UNION ALL
            SELECT id, name, email, 'admin' AS user_type, password FROM admins
        ) AS combined_users
        WHERE email = $1 AND password = $2`,
        [email, password]
      );

    if (result.rows.length > 0) {
      const user = result.rows[0];

      req.session.userId = user.id;
      req.session.userEmail = user.email;
      req.session.userName = user.name;

      console.log('Login Attempt:', email, password);

      if (user.user_type === 'customer') {
        res.redirect(`/customerHome/?user=${user.id}`);
      } else if (user.user_type === 'admin') {
        res.redirect(`/adminHome/?admin=${user.id}`);
      } else {
        res.redirect('/');
      }
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




app.listen(PORT, () => {
  console.log(`server started http://localhost:${PORT}`);
  postgresClient.connect((err: Error) => {
    if (err) {
      console.log('Connection error', err.stack);
    } else {
      console.log('DB connection successful');
    }
  });
});
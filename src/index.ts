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

app.post('/customerAdd', async (req, res) => {
  const { name, surname, email, password } = req.body;

  try {
      console.log('INSERT INTO customers (name, surname, email, password) VALUES ($1, $2, $3, $4) RETURNING *', [name, surname, email, password]);

      const result = await postgresClient.query(
          'INSERT INTO customers (name, surname, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
          [name, surname, email, password]
      );

      console.log('Result:', result.rows);

      const newCustomer = result.rows[0];

      res.json({ newCustomer });
  } catch (error) {
      console.error('Error registering customer:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await postgresClient.query(
      'SELECT * FROM customers WHERE email = $1 AND password = $2',
      [email, password]
    );

    if (result.rows.length > 0) {
      const customer = result.rows[0];

      req.session.userId = customer.id;
      req.session.userEmail = customer.email;
      req.session.userName = customer.name;

      res.redirect(`/customerHome/?user=${customer.id}`);
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
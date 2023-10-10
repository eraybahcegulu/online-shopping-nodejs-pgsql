import express from 'express'
import postgresClient from '../config/db'
import path from 'path';
import session from 'express-session';
import authRoutes from './routes/auth/authRoutes';
import adminOrderRoutes from './routes/admin/viewsOrdersRoutes';
import productRoutes from './routes/admin/productRoutes';
import customerRoutes from './routes/admin/addCustomerRoutes';
import productTypeRoutes from './routes/admin/addProductTypeRoutes';
import customerHomeRoutes from './routes/customer/homeRoutes';
import adminHomeRoutes from './routes/admin/homeRoutes';
import customerCartRoutes from './routes/customer/cartRoutes';
import customerOrderRoutes from './routes/customer/orderRoutes';


const app = express()
const PORT = 5000;


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
    userType?: string;
  }
}


app.set('view engine', 'ejs');


app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const ejsDirs = [
  path.join(__dirname, 'views/auth'),
  path.join(__dirname, 'views/admin'),
  path.join(__dirname, 'views/customer'),
];
app.set('views', ejsDirs);

app.use('/', authRoutes);
app.use('/', adminOrderRoutes);
app.use('/', productRoutes);
app.use('/', customerRoutes);
app.use('/', productTypeRoutes);
app.use('/', customerHomeRoutes);
app.use('/', adminHomeRoutes);
app.use('/', customerCartRoutes);
app.use('/', customerOrderRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.render('login');
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
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
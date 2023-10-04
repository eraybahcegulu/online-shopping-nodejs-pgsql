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

app.get('/', (req, res) => {
  res.render('login');
});




app.get('/productAdd', async (req, res) => {
  try {

    const resultProductTypes = await postgresClient.query('SELECT * FROM product_types');
    const resultProducts = await postgresClient.query('SELECT * FROM products');
    console.log('Result:', resultProductTypes.rows);
    res.render('productAdd', { productTypes: resultProductTypes.rows, products:resultProducts.rows  });
  } catch (error) {
    console.error('Error fetching product types:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/customerAdd',  async (req, res) => {
  const resultCustomers = await postgresClient.query('SELECT * FROM customers');
  res.render('customerAdd', { customers: resultCustomers.rows });
});

app.get('/productTypeAdd', async (req, res) => {
  try {
    const result = await postgresClient.query('SELECT * FROM product_types');

    console.log('Result:', result.rows);
    res.render('productTypeAdd', { productTypes: result.rows });
  } catch (error) {
    console.error('Error fetching product types:', error);
    res.status(500).send('Internal Server Error');
  }
});




app.get('/customerHome', async (req, res) => {
  const urlUserId = req.query.user;

  if (req.session.userId && req.session.userId.toString() === urlUserId) {
    try {
      const result = await postgresClient.query('SELECT id, type, name, price, description FROM products');
      const products = result.rows;

      const user = {
        userId: req.session.userId,
        userName: req.session.userName,
        userEmail: req.session.userEmail
      };

      res.render('customerHome', { user, products });
    } catch (error) {
      console.error('Error fetching product details:', error);
      res.status(500).send('Internal Server Error');
    }
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
    res.render('adminHome', { user , urlAdminId });
  } else {
    res.redirect('/');
  }
});




app.get('/productUpdate/:id', async (req, res) => {
  const productId = req.params.id;
  const urlAdminId = req.query.admin;

  try {
    const productResult = await postgresClient.query('SELECT * FROM products WHERE id = $1', [productId]);

    const productTypeResult = await postgresClient.query('SELECT * FROM product_types');

    if (productResult.rows.length > 0) {
      const product = productResult.rows[0];

      res.render('productUpdate', { productId, product, urlAdminId, productTypes: productTypeResult.rows });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error retrieving product for update:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/getCustomers', async (req, res) => {
  try {
    const result = await postgresClient.query('SELECT * FROM customers');
    const customers = result.rows;

    res.json(customers);
  } catch (error) {
    console.error('Error retrieving customers:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.patch('/updateProduct/:id', async (req, res) => {

  const productId = req.params.id;
  const { name, productType, price, description } = req.body;

  try {
    const result = await postgresClient.query(
      'UPDATE products SET name = $1, type = $2, price = $3, description = $4 WHERE id = $5 RETURNING *',
      [name, productType, price, description, productId]
    );

    if (result.rows.length > 0) {
      const updatedProduct = result.rows[0];
      res.json({ message: 'Product updated successfully', updatedProduct });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error: any) {
    if (error.code === '22P02') {
      res.json({ error: 'Enter number for price' });
    } else {
      console.error('error:', error);
      res.status(500).json({ error: 'error' });
    }
  }
});


app.delete('/deleteProduct/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    const result = await postgresClient.query('DELETE FROM products WHERE id = $1', [productId]);

    if (result.rowCount > 0) {
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/adminProducts', async (req, res) => {
  try {
    const urlAdminId = req.query.admin;
    const result = await postgresClient.query('SELECT id, type, name, price, description FROM products');
    const products = result.rows;

    res.render('adminProducts', { products, urlAdminId });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).send('Internal Server Error');
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
  } catch (error: any) {
    if (error.code === '23505') {
      res.json({ error: 'This email address is already registered' });
    } else {
      console.error('error:', error);
      res.status(500).json({ error: 'error' });
    }
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
      console.error('error', error);
      res.status(500).json({ error: 'error' });
  }
});

app.post('/productTypeAdd', async (req,res) => {
  const { type } = req.body;

  try {

    await postgresClient.query('INSERT INTO product_types (type) VALUES ($1)', [type]);

    res.json({ newProductType : type });
  } catch (error) {
    console.error('Error adding product type:', error);
    res.status(500).json({ message: 'Internal Server Error' });
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
        res.render('login', { error: 'Invalid email or password' });
      }
    } else {
      res.render('login', { error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('error', error);
    res.status(500).json({ error: 'error' });
  }
});

app.post('/addCard', async (req, res) => {
  const { productId } = req.body;
  const userId = req.session.userId;

  try {
      const result = await postgresClient.query('SELECT * FROM products WHERE id = $1', [productId]);

      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Product not found' });
      }

      const selectedProduct = result.rows[0];

      const insertResult = await postgresClient.query(
          'INSERT INTO carts (customer_id, products_id, products_type, products_name, products_price, products_description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [userId, selectedProduct.id, selectedProduct.type, selectedProduct.name, selectedProduct.price, selectedProduct.description]
      );

      const deleteResult = await postgresClient.query('DELETE FROM products WHERE id = $1 RETURNING *', [productId]);  

      const addedToCartProduct = insertResult.rows[0];
      console.log('Added to cart:', addedToCartProduct);
      console.log('silinen ürün ', deleteResult);
      res.json(addedToCartProduct);
  } catch (error) {
      console.error('Error:', error);
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
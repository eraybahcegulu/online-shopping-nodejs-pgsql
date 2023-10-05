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
    userType?: string;
  }
}
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});


app.set('view engine', 'ejs');

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
const PORT = 5000;

app.set('views', path.join(__dirname, 'public/views'));
app.use(express.static(path.join(__dirname, 'public/views')));

app.get('/', (req, res) => {
  res.render('login');
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
        res.redirect('/customerHome');
      } else if (user.user_type === 'admin') {
        res.redirect('/adminHome');
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


app.get('/productAdd', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  try {
    const resultProductTypes = await postgresClient.query('SELECT * FROM product_types');
    const resultProducts = await postgresClient.query('SELECT * FROM products');
    console.log('Result:', resultProductTypes.rows);
    res.render('productAdd', { productTypes: resultProductTypes.rows, products: resultProducts.rows });
  } catch (error) {
    console.error('Error fetching product types:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/customerAdd', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }

  try {
    const resultCustomers = await postgresClient.query('SELECT * FROM customers');
    res.render('customerAdd', { customers: resultCustomers.rows });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).send('Internal Server Error');
  }
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
  if (!req.session.userId) {
    return res.redirect('/');
  }
    try {
      const result = await postgresClient.query('SELECT id, type, name, price, description FROM products');
      const products = result.rows;

      const user = {
        userId: req.session.userId,
        userName: req.session.userName,
        userEmail: req.session.userEmail
      };

      const cartResult = await postgresClient.query('SELECT * FROM carts WHERE customer_id = $1', [user.userId]);
      const cartItems = cartResult.rows;

      const orderResult = await postgresClient.query('SELECT * FROM orders WHERE customer_id = $1', [user.userId]);
      const ordersItems = orderResult.rows;

      res.render('customerHome', { user, products, cartItems, cartItemCount: cartItems.length, ordersItems, orderItemCount: ordersItems.length });
    } catch (error) {
      console.error('Error fetching product details:', error);
      res.status(500).send('Internal Server Error');
    }

});

app.get('/adminHome', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
    const user = {
      userId: req.session.userId,
      userName: req.session.userName,
      userEmail: req.session.userEmail
    };
    res.render('adminHome', { user });

});





app.get('/productUpdate/:id', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
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
  if (!req.session.userId) {
    return res.redirect('/');
  }
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
  if (!req.session.userId) {
    return res.redirect('/');
  }

  const productId = req.params.id;
  const { name, productType, price, description } = req.body;

  try {
    const result = await postgresClient.query(
      'UPDATE products SET name = $1, type = $2, price = $3, description = $4 WHERE id = $5 RETURNING *',
      [name, productType, price, description, productId]
    );

    await postgresClient.query(
      'UPDATE carts SET products_name = $1, products_type = $2, products_price = $3, products_description = $4 WHERE products_id = $5 RETURNING *',
      [name, productType, price, description, productId]);

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
  if (!req.session.userId) {
    return res.redirect('/');
  }
  const productId = req.params.id;

  try {
    const result = await postgresClient.query('DELETE FROM products WHERE id = $1', [productId]);
    await postgresClient.query('DELETE FROM carts WHERE products_id = $1', [productId]);

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
  if (!req.session.userId) {
    return res.redirect('/');
  }
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
  if (!req.session.userId) {
    return res.redirect('/');
  }

  const { name, surname, email, password } = req.body;

  try {
    const result = await postgresClient.query(
      'INSERT INTO customers (name, surname, email, password, user_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, surname, email, password, 'customer']
    );

    const newCustomer = result.rows[0];

    res.json({ newCustomer });
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'This email address is already registered' });
    } else {
      console.error('error:', error);
      res.status(500).json({ error: 'error' });
    }
  }
});

app.post('/productAdd', async (req, res) => {

  if (!req.session.userId) {
    return res.redirect('/');
  }


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

app.post('/productTypeAdd', async (req, res) => {

  if (!req.session.userId) {
    return res.redirect('/');
  }

  const { type } = req.body;

  try {

    await postgresClient.query('INSERT INTO product_types (type) VALUES ($1)', [type]);

    res.json({ newProductType: type });
  } catch (error) {
    console.error('Error adding product type:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




app.post('/addCart', async (req, res) => {

  if (!req.session.userId) {
    return res.redirect('/');
  }

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


    const addedToCartProduct = insertResult.rows[0];
    console.log('Added to cart:', addedToCartProduct);
    res.json({ success: true, message: 'Product successfully added to your cart', addedToCartProduct });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/cart', async (req, res) => {
  
  if (!req.session.userId) {
    return res.redirect('/');
  }
    const userId = req.session.userId;
    const userName = req.session.userName;
    const userEmail = req.session.userEmail;

    try {
      const result = await postgresClient.query('SELECT * FROM carts WHERE customer_id = $1', [userId]);
      const cartItems = result.rows;

      res.render('customerCart', { userId, userName, cartItems, userEmail });
    } catch (error) {
      console.error('Error fetching cart details:', error);
      res.status(500).send('Internal Server Error');
    }

});

app.post('/order', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }

  const userId = req.session.userId;
  const userEmail = req.session.userEmail;
  const userName = req.session.userName;

  try {
    const cartItems = await postgresClient.query('SELECT * FROM carts WHERE customer_id = $1', [userId]);

    if (cartItems.rows.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const orderAmount = cartItems.rows.reduce((total, item) => total + parseFloat(item.products_price.replace(',', '')), 0);

    const orderResult = await postgresClient.query(
      'INSERT INTO orders (customer_id, customer_name, customer_email, order_amount) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, userName, userEmail, orderAmount]
    );

    const orderId = orderResult.rows[0].id;

    for (const item of cartItems.rows) {
      await postgresClient.query(
        'INSERT INTO order_items (order_id, products_id, products_type, products_name, products_price, products_description) VALUES ($1, $2, $3, $4, $5, $6)',
        [orderId, item.products_id, item.products_type, item.products_name, item.products_price, item.products_description]
      );


    }
    await postgresClient.query('DELETE FROM carts WHERE customer_id = $1', [userId]);

    res.json({ success: true, orderId: orderId });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/myOrders', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
    try {
      const userId = req.session.userId;
      const ordersQuery = await postgresClient.query('SELECT * FROM orders WHERE customer_id = $1', [userId]);

      const orders = [];
      for (const order of ordersQuery.rows) {
        const orderItemsQuery = await postgresClient.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
        const orderItems = orderItemsQuery.rows;

        orders.push({
          ...order,
          items: orderItems,
        });
      }

      res.render('customerOrder', { orders });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }

});



app.get('/viewOrders', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }

  try {
    const ordersQuery = await postgresClient.query('SELECT * FROM orders');
    const orderDetails = await postgresClient.query('SELECT * FROM order_items');

    const orders = [];
    for (const order of ordersQuery.rows) {
      const orderItemsQuery = await postgresClient.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
      const orderItems = orderItemsQuery.rows;

      const customerQuery = await postgresClient.query('SELECT * FROM customers WHERE id = $1', [order.customer_id]);
      const customer = customerQuery.rows[0];

      orders.push({
        ...order,
        customer: customer,
        items: orderItems,
      });
    }

    res.render('adminOrders', { orders, orderDetails: orderDetails.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});



app.post('/removeCart', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }

  const { cartId } = req.body;
  const userId = req.session.userId;

  try {
    const result = await postgresClient.query('SELECT * FROM carts WHERE id = $1', [cartId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const selectedCart = result.rows[0];

    const deleteResult = await postgresClient.query(
      'DELETE FROM carts WHERE customer_id = $1 AND id = $2 RETURNING *',
      [userId, selectedCart.id]
    );


    const removedCartProduct = deleteResult.rows[0];
    console.log('Added to cart:', removedCartProduct);
    res.json({ success: true, message: 'Product successfully added to your cart', removedCartProduct });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/removeOrder', async (req, res) => {

  if (!req.session.userId) {
    return res.redirect('/');
  }

  const { orderId } = req.body;


  try {
    const removeOrder = await postgresClient.query(
      'DELETE FROM orders WHERE id= $1 RETURNING *',
      [orderId]
    );


    const removedOrder = removeOrder.rows[0];
    console.log('Removed order:', removedOrder);
    res.json({ success: true, message: 'Removed order', removedOrder });
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
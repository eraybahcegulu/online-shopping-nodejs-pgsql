import express from 'express'
import postgresClient from './config/db.js'

const app = express()
app.use(express.json())


const PORT = 5000;

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
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Backend running on port ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('Database connected...');
  } catch (err) {
    console.error('DB connection error:', err);
  }
});
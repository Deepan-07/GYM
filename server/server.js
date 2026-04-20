require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import Middlewares
const { errorHandler } = require('./middleware/errorHandler');

// Import Models
const Admin = require('./models/Admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log("Connected DB:", mongoose.connection.name);

    // Seed Super Admin on first run
    await seedSuperAdmin();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedSuperAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: 'admin@gymplatform.com' });
    if (!adminExists) {
      await Admin.create({
        email: 'admin@gymplatform.com',
        password: 'Admin@1234',
        role: 'superadmin'
      });
      console.log('Super Admin Seeded Successfully');
    }
  } catch (err) {
    console.error('Error seeding admin', err);
  }
};

// Start jobs
require('./jobs/statusUpdater');
require('./jobs/reminderJob');

// Routes (to be loaded)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/gym', require('./routes/gym'));
app.use('/api/client', require('./routes/client'));
app.use('/api/plan', require('./routes/plan'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/redtag', require('./routes/redtag'));
app.use('/api/admin', require('./routes/admin'));

// Error Handler Middleware
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

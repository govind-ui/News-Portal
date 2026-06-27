const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// Load env
dotenv.config();

const app = express();

// Body parser
app.use(express.json());
// CORS
app.use(cors());

// DB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/news-portal')
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.log('MongoDB Connection Error: ', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/category', require('./routes/categoryRoutes'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

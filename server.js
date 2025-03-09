// server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Create Express app
const app = express();
app.use(express.json());

// Mount game routes under /api/game/
const gameRoutes = require('./routes/gameRoutes');
app.use('/api/game', gameRoutes);

// Start listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

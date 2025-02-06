const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const path = require('path');
const authroutes = require('./routes/auth');
const noteroutes = require('./routes/note');
// const forgotPasswordLimiter = require('./midlleware/rateLimitter');
const app = express();
// Connect to Database
connectDB();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// routes
app.use('/api/auth', authroutes);
app.use('/api/note', noteroutes);
app.get("/", (req, res) => {
    res.send({
        message: "Backend Quick Notes",
        author: "Ramsheessss",
    });
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:3000`);
});

const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign(
        { _id: userId }, 
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '24h' }
    );
};

module.exports = {
    generateToken
};
const rateLimit = require('express-rate-limit');

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // max 3 requests per windowMs
    message: 'Terlalu banyak permintaan reset password, coba lagi setelah 15 menit'
});

module.exports = {
    forgotPasswordLimiter
};
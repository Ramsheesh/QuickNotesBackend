const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/token');
const { sendResetPasswordEmail } = require('../utils/email');
const crypto = require('crypto');

const createResponse = (res, statusCode, status, message, data = null) => {
    const response = {
        status,
        statusCode,
        message
    };
    if (data) response.data = data;
    return res.status(statusCode).json(response);
};

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, status } = req.body;

        if (!username || !email || !password) {
            return createResponse(
                res,
                400,
                'error',
                'Username, email, dan password harus diisi',
                {
                    received: {
                        username: !!username,
                        email: !!email,
                        password: !!password
                    }
                }
            );
        }

        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            return createResponse(
                res,
                400,
                'error',
                'Username atau email sudah terdaftar',
                {
                    conflict: {
                        username: existingUser.username === username,
                        email: existingUser.email === email
                    }
                }
            );
        }

        const hashedPassword = await hashPassword(password);
        const user = new User({
            username,
            email,
            password: hashedPassword,
            status: status || 'active'
        });

        await user.save();
        const token = generateToken(user._id);

        return createResponse(
            res,
            201,
            'success',
            'Registrasi berhasil',
            {
                user: {
                    username: user.username,
                    email: user.email,
                    status: user.status
                },
                token
            }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return createResponse(
            res,
            500,
            'error',
            'Error saat registrasi',
            { errorDetail: error.message }
        );
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return createResponse(
                res,
                400,
                'error',
                'Username dan password harus diisi'
            );
        }

        const user = await User.findOne({ username });

        if (!user) {
            return createResponse(
                res,
                404,
                'error',
                'Pengguna tidak ditemukan'
            );
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return createResponse(
                res,
                401,
                'error',
                'Kata sandi salah'
            );
        }

        const token = generateToken(user._id);
        return createResponse(
            res,
            200,
            'success',
            'Berhasil login',
            {
                user: {
                    username: user.username,
                    email: user.email,
                    status: user.status
                },
                token
            }
        );
    } catch (error) {
        console.error('Login error:', error);
        return createResponse(
            res,
            500,
            'error',
            'Terjadi kesalahan saat login',
            { errorDetail: error.message }
        );
    }
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { username } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return createResponse(
                res,
                404,
                'error',
                'Username tidak ditemukan'
            );
        }
        const resetToken = crypto.randomBytes(32).toString('hex');

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 Jam
        await user.save();
        try {
            await sendResetPasswordEmail(user.email, resetToken);

            return createResponse(
                res,
                200,
                'success',
                'Email reset password telah dikirim'
            );
        } catch (emailError) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            return createResponse(
                res,
                500,
                'error',
                'Gagal mengirim email reset',
                { errorDetail: emailError.message }
            );
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        return createResponse(
            res,
            500,
            'error',
            'Error saat memproses permintaan forgot password',
            { errorDetail: error.message }
        );
    }
});

router.get('/verify-reset-token/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return createResponse(
                res,
                400,
                'error',
                'Token Reset Password Telah Kedaluwarsa'
            );
        }

        return createResponse(
            res,
            200,
            'success',
            'Token valid',
            { username: user.username }
        );
    } catch (error) {
        return createResponse(
            res,
            500,
            'error',
            'Error saat verifikasi token',
            { errorDetail: error.message }
        );
    }
});

router.post('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return createResponse(
                res,
                400,
                'error',
                'Token Reset Password Telah Kedaluwarsa'
            );
        }

        const { password } = req.body;
        const hashedPassword = await hashPassword(password);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return createResponse(
            res,
            200,
            'success',
            'Password berhasil direset'
        );
    } catch (error) {
        return createResponse(
            res,
            500,
            'error',
            'Error saat reset password',
            { errorDetail: error.message }
        );
    }
});

module.exports = router;
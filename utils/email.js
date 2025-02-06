const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

const sendResetPasswordEmail = async (email, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/verify-reset-token/${token}`;
    
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Reset Password Link',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background:rgb(102, 159, 243); padding: 20px; text-align: center;">
                    <img src="https://i.imgur.com/egHdOJu.png" alt="QuickNotes Logo" style="max-width: 150px;"/>
                </div>
                
                <div style="padding: 20px; background: #fff; border: 1px solid #e5e7eb;">
                    <h1 style="color: #1f2937; margin-bottom: 20px;">Reset Password Request</h1>
                    
                    <p style="color: #4b5563; line-height: 1.5;">Hello,</p>
                    
                    <p style="color: #4b5563; line-height: 1.5;">We received a request to reset your password. Click the button below to create a new password:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                            style="background: #297af3; color: #fff; padding: 12px 30px; 
                                    text-decoration: none; border-radius: 5px; font-weight: bold;">
                            Reset Password
                        </a>
                    </div>
                     <p style="color: #4b5563; line-height: 1.5;">This link will expire in 1 hour.</p>
                    
                    <p style="color: #4b5563; line-height: 1.5;">If you didn't request this, please ignore this email.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <p style="color: #6b7280; font-size: 14px;">Best regards,<br>QuickNotes Development Team</p>
                </div>
                
                <div style="background: #f3f4f6; padding: 20px; text-align: center;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} QuickNotes. All rights reserved.
                    </p>
                </div>
            </div>
        `
    };
    return await transporter.sendMail(mailOptions);
};

module.exports = {
    sendResetPasswordEmail
};
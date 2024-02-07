const nodeMailer = require('nodemailer')
const emailExistence = require('email-existence');

function isEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return regex.test(email);
}

function checkEmailExistence(email) {
    return new Promise((resolve, reject) => {
        emailExistence.check(email, (error, exists) => {
            if (error) {
                reject(error);
            } else {
                resolve(exists);
            }
        });
    });
}

function sendMail(to, subject, content) {
    const transport = nodeMailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        }
    })

    const options = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: to,
        subject: subject,
        html: content
    }
    
    return transport.sendMail(options);
}

module.exports = {
    sendMail,
    checkEmailExistence,
    isEmail
};
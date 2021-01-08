const nodemailer = require('nodemailer');
const defaultMailingList = "tsquang398@gmail.com, tanloi2910@gmail.com";
const senderEmail = "mail4homework123@gmail.com";
const senderPassword = "testmail123"; // gmail app password
module.exports = {
    sendMail: async (subject, text, to = defaultMailingList) => {
        try {
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: senderEmail,
                    pass: senderPassword,
                },
            });

            const message = {
                from: `report sender <${senderEmail}>`,
                to,
                subject,
                text: subject,
                html: text,
            };

            transporter.sendMail(message, () => { });
        } catch (e) {
            // handle errors here
        }
    },
};
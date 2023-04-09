const nodemailer = require("nodemailer");
exports.main = async (email, message, subject, text) => {
    console.log("execute0")
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.GMAIL_ID,
            pass: process.env.GMAIL_APP
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: 'itsme@gmail.com', // sender address
        to: email, // list of receivers
        subject: subject != undefined ? subject : "Internative Ed-tech otp", // Subject line
        text: text != undefined ? text : "Here is Your Otp For Internative Ed-tech", // plain text body
        html: message, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
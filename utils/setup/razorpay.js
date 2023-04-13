const Razorpay = require('razorpay');


// create a Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET
});
const callbackUrl = process.env.CALLBACK
// create a route to generate a payment link
exports.getPaymentLink = (courseId, courseName, customer, amount, enrollId) => {
    // create a payment link options object with amount, currency, description and callback_url
    const options = {
        amount: amount * 100, // amount in smallest currency unit
        currency: 'INR',
        description: courseName,
        customer: {
            name: customer.name,
            email: customer.email,
            contact: customer.mobileNo
        },
        notify: {
            sms: false,
            email: false
        },
        reminder_enable: false,
        notes: {
            course_name: courseName,
            recordId: enrollId
        },
        callback_url: callbackUrl,
        callback_method: "get",
        options: {
            checkout: {
                name: "Intetnative Ed-Tech Pvt. Ltd.",
                theme: {
                    hide_topbar: true
                }
            }
        }
    };

    // create a payment link using the Razorpay instance
    return new Promise((resolve, reject) => {
        razorpay.paymentLink.create(options, (err, link) => {
            if (err) {
                // handle error
                console.log(err);
                reject(err);
            } else {
                // send payment link details to frontend
                resolve(link)
            }
        })
    });
};
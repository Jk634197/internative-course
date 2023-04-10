const Razorpay = require('razorpay');


// create a Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET
});

// create a route to generate a payment link
exports.getPaymentLink = (courseId, amount) => {
    // create a payment link options object with amount, currency, description and callback_url
    const options = {
        amount: amount, // amount in smallest currency unit
        currency: 'INR',
        description: 'Test Payment Link',
        customer: {
            name: "Gaurav Kumar",
            email: "gaurav.kumar@example.com",
            contact: "+919000090000"
        },
        notify: {
            sms: false,
            email: false
        },
        reminder_enable: false,
        notes: {
            course_name: "c++"
        },
        callback_url: "https://example-callback-url.com/",
        callback_method: "get"
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
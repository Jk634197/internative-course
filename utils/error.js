const { validationResult } = require('express-validator')
exports.checkErr = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ issuccess: false, data: { acknowledgement: false }, message: errors.array()[0].msg });
    }
    next();
}
exports.getRandomIntInclusive = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}
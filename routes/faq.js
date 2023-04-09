const express = require('express');
const router = express.Router();
const { body, validationResult, param } = require('express-validator');
const { default: mongoose } = require('mongoose');
const FAQ = require('../models/faqSchema');
const { checkErr } = require('../utils/error');

// Create a new FAQ
router.post('/add', [
    body('question', 'Please provide a valid question').notEmpty().isString(),
    body('answer', 'Please provide a valid answer').notEmpty().isString()
], checkErr, async (req, res) => {
    const { question, answer } = req.body;
    const faq = new FAQ({ question, answer });
    await faq.save();
    return res.status(201).json({ issuccess: true, data: faq, message: 'FAQ added successfully' });
});

// Read all FAQs
router.get('/', async (req, res) => {
    const faqs = await FAQ.find();
    return res.status(200).json({ issuccess: true, data: faqs, message: 'FAQs found' });
});
 
// Read one FAQ
router.get('/:id', [param('id').custom(async (value) => {
    if (!mongoose.isValidObjectId(value)) {
        throw new Error('Invalid FAQ id');
    }
    const faq = await FAQ.findById(value);
    if (!faq) {
        throw new Error('FAQ not found');
    }
})], checkErr, async (req, res) => {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
        return res.status(404).json({ issuccess: false, data: null, message: 'FAQ not found' });
    }
    return res.status(200).json({ issuccess: true, data: faq, message: 'FAQ found' });
});

// Update a FAQ
router.put('/:id', [
    body('question').notEmpty().isString(),
    body('answer').notEmpty().isString(),
    param('id').custom(async (value) => {
        if (!mongoose.isValidObjectId(value)) {
            throw new Error('Invalid FAQ ID');
        }
        const faq = await FAQ.findById(value);
        if (!faq) {
            throw new Error('FAQ not found');
        }
    })
], checkErr, async (req, res) => {
    const { question, answer } = req.body;
    const faq = await FAQ.findById(req.params.id);
    let update = await FAQ.findByIdAndUpdate(req.params.id, {
        question,
        answer
    }, { new: true });
    return res.status(200).json({ issuccess: true, data: update, message: 'FAQ updated successfully' });
});

// Delete a FAQ
router.delete('/:id', [param('id').custom(async (value) => {
    if (!mongoose.isValidObjectId(value)) {
        throw new Error('Invalid FAQ ID');
    }
    const faq = await FAQ.findById(value);
    if (!faq) {
        throw new Error('FAQ not found');
    }
})], checkErr, async (req, res) => {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) {
        return res.status(404).json({ issuccess: false, data: null, message: 'FAQ not found' });
    }
    return res.status(200).json({ issuccess: true, data: faq, message: 'FAQ deleted successfully' });
});

module.exports = router;

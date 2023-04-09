const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Course = require('../models/courseSchema');
const Question = require('../models/questionSchema');

// Create a new question
router.post('/questions', [
    body('question').notEmpty().withMessage('Question is required'),
    body('options').isArray().withMessage('Options should be an array'),
    body('answer').notEmpty().withMessage('Answer is required'),
    body('courseId').notEmpty().withMessage('Course ID is required')
        .custom(async (value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Course ID is not a valid ObjectId');
            }
        })
        .custom(async (value) => {
            const course = await Course.findById(value);
            if (!course) {
                throw new Error('Course not found');
            }
        }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const question = new Question(req.body);
        await question.save();
        res.status(201).json(question);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Read all questions
router.get('/questions', async (req, res) => {
    try {
        const questions = await Question.find();
        res.json(questions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Read one question
router.get('/questions/:id', async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json(question);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update a question
router.put('/questions/:id', [
    body('question').notEmpty().withMessage('Question is required'),
    body('options').isArray().withMessage('Options should be an array'),
    body('answer').notEmpty().withMessage('Answer is required'),
    body('courseId').notEmpty().withMessage('Course ID is required')
        .custom(async (value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Course ID is not a valid ObjectId');
            }
        })
        .custom(async (value) => {
            const course = await Course.findById(value);
            if (!course) {
                throw new Error('Course not found');
            }
        }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json(question);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a question
router.delete('/questions/:id', async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json({ message: 'Question deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
module.exports = router;
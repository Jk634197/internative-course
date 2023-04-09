// Modules CRUD APIs
// const Modules = require('../models/modules');
const { default: mongoose } = require('mongoose');
const modulesSchema = require('../models/modulesSchema');

// Add a module to a course
exports.addModules = async (modules, courseId) => {
    try {
        await modulesSchema.deleteMany({ courseId: new mongoose.Types.ObjectId(courseId) });
        const newQuestions = modules.map((question) => ({ ...question, courseId }));
        const savedQuestions = await modulesSchema.insertMany(newQuestions);
        return { isSuccess: true, data: savedQuestions, message: 'modules added successfully.' };
    } catch (error) {
        console.log(error);
        return { isSuccess: false, message: 'Internal server error.' };
    }
};

// Update a module
exports.updateModule = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { title, modules } = req.body;
        const updatedModule = await Modules.findByIdAndUpdate(
            moduleId,
            { title, modules },
            { new: true }
        );
        return res.status(200).json({ isSuccess: true, data: updatedModule, message: 'Module updated successfully.' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ isSuccess: false, message: 'Internal server error.' });
    }
};

// Delete a module
exports.deleteModule = async (req, res) => {
    try {
        const { moduleId } = req.params;
        await Modules.findByIdAndDelete(moduleId);
        return res.status(200).json({ isSuccess: true, message: 'Module deleted successfully.' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ isSuccess: false, message: 'Internal server error.' });
    }
};

// Get all modules of a course
exports.getModulesByCourseId = async (req, res) => {
    try {
        const { courseId } = req.params;
        const modules = await Modules.find({ courseId });
        return res.status(200).json({ isSuccess: true, data: modules, message: 'Modules found successfully.' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ isSuccess: false, message: 'Internal server error.' });
    }
};
exports.submitAnswer = async (questionId, userId, answer) => {
    let getQuestion = await userQuestion.findById(questionId);
    if (getQuestion != null || getQuestion != undefined) {
        let getAnswer = await questionSchema.find({ question: getQuestion.question });
        if (getQuestion.answer == "") {
            if (getAnswer != undefined && getAnswer.answer == answer) {
                await userQuestion.findByIdAndUpdate(questionId, { answer: answer }, { new: true });
                await userAttempt.findByIdAndUpdate(getQuestion.attemptId, { $inc: { result: 1 } }, { new: true });
            }
            else {
                await userQuestion.findByIdAndUpdate(questionId, { answer: answer }, { new: true });
            }
        }
        else if (answer != getQuestion.answer) {
            if (getAnswer != undefined && getAnswer.answer == answer) {
                await userQuestion.findByIdAndUpdate(questionId, { answer: answer }, { new: true });
                await userAttempt.findByIdAndUpdate(getQuestion.attemptId, { $inc: { result: 1 } }, { new: true });
            }
            else {

                await userQuestion.findByIdAndUpdate(questionId, { answer: answer }, { new: true });
                await userAttempt.findByIdAndUpdate(getQuestion.attemptId, { $inc: { result: -1 } }, { new: true });

            }
        }

    }
}
exports.setQuestions = async (userId, attemptId, questions) => {
    let questionsModel = [];
    for (i = 0; i < questions.length; i++) {
        let question = new userQuestion({
            userId,
            attemptId,
            question: questions[i].question
        })
        questionsModel.push(question)
    }
    await userQuestion.insertMany(questionsModel);
}
// Questions CRUD APIs
// const Question = require('../models/question');
const questionSchema = require('../models/questionSchema');
const userQuestion = require('../models/userQuestion');

exports.addQuestions = async (questions, courseId) => {
    try {

        await questionSchema.deleteMany({ courseId: new mongoose.Types.ObjectId(courseId) });
        const newQuestions = questions.map((question) => ({ ...question, courseId }));
        const savedQuestions = await questionSchema.insertMany(newQuestions);
        return { isSuccess: true, data: savedQuestions, message: 'Questions added successfully.' };
    } catch (error) {
        console.log(error);
        return { isSuccess: false, message: 'Internal server error.' };
    }
};


// Get questions by courseId
exports.getQuestionsByCourseId = async (req, res) => {
    try {
        const { courseId } = req.params;
        const questions = await Question.find({ courseId });
        return res.status(200).json({ isSuccess: true, data: questions, message: 'Questions found successfully.' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ isSuccess: false, message: 'Internal server error.' });
    }
};

const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    topic: { type: String, required: true },
    modules: [{
        moduleTitle: String,
        content: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
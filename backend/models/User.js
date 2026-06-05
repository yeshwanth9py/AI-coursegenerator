const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Name is required'] },
    email: { type: String, required: [true, 'Email is required'], unique: true },
    password: { type: String },                    // Optional for Auth0 users
    auth0Id: { type: String, default: null },      // Auth0 subject identifier
    picture: { type: String, default: null },       // Profile picture URL
    authProvider: { type: String, enum: ['local', 'auth0'], default: 'local' },
}, { timestamps: true });

// Pre-save middleware — only hash password for local users
userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;  // Auth0 users have no local password
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
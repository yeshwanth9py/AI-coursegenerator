const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with email & password (local auth)
 * @access  Public
 */
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            authProvider: 'local',
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user with email & password (local auth)
 * @access  Public
 */
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

/**
 * @route   POST /api/auth/auth0-sync
 * @desc    Sync an Auth0-authenticated user to our database.
 *          Creates the user if first time, otherwise returns existing record.
 *          This runs AFTER Auth0 redirects back and the frontend SDK has a valid session.
 * @access  Public (called right after Auth0 redirect — no JWT yet)
 */
const auth0Sync = async (req, res) => {
    const { email, name, auth0Id, picture } = req.body;

    if (!email || !auth0Id) {
        return res.status(400).json({ message: 'Email and auth0Id are required' });
    }

    try {
        // Look up by auth0Id first, then by email as fallback
        let user = await User.findOne({ auth0Id });

        if (!user) {
            // Check if a local user with this email exists
            user = await User.findOne({ email });

            if (user) {
                // Link this Auth0 identity to the existing local account
                user.auth0Id = auth0Id;
                user.name = user.name || name || 'User';
                user.picture = picture || user.picture;
                user.authProvider = 'auth0';
                await user.save({ validateBeforeSave: false });
            } else {
                // Brand new Auth0 user — create record
                user = await User.create({
                    name: name || 'User',
                    email,
                    auth0Id,
                    picture,
                    authProvider: 'auth0',
                    // No password — Auth0 manages authentication
                });
            }
        } else {
            // Existing Auth0 user — update name/picture if changed
            let needsSave = false;
            if (!user.name && name) { user.name = name; needsSave = true; }
            if (picture && picture !== user.picture) { user.picture = picture; needsSave = true; }
            if (needsSave) await user.save({ validateBeforeSave: false });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            picture: user.picture,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Auth0 sync error:', error);
        res.status(500).json({ message: 'Failed to sync Auth0 user' });
    }
};

module.exports = { registerUser, loginUser, auth0Sync };
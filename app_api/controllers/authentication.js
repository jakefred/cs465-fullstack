const passport = require('passport');
const User = require('../models/user');

const hasText = value => typeof value === 'string' && value.trim().length > 0;

const register = async (req, res, next) => {
    const { name, email, password } = req.body || {};
    if (![name, email, password].every(hasText)) {
        return res.status(400).json({ message: 'All fields required' });
    }

    try {
        const user = new User({ name, email });
        user.setPassword(password);
        await user.save();
        return res.status(200).json({ token: user.generateJWT() });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'A valid name and email are required.' });
        }
        return next(error);
    }
};

const login = (req, res, next) => {
    const { email, password } = req.body || {};
    if (![email, password].every(hasText)) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    return passport.authenticate('local', { session: false }, (error, user, info) => {
        if (error) return next(error);
        if (!user) return res.status(401).json(info);
        try {
            return res.status(200).json({ token: user.generateJWT() });
        } catch (error) {
            return next(error);
        }
    })(req, res, next);
};

module.exports = { register, login };

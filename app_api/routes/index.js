const express = require ("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authentication');

const tripsController = require("../controllers/trips");

// Only verified Bearer tokens may reach controllers that change trip data.
function authenticateJWT(req, res, next) {
    const match = /^Bearer\s+(\S+)$/i.exec(req.get('Authorization') || '');
    if (!match) {
        return res.status(401).json({ message: 'A Bearer token is required.' });
    }
    try {
        req.auth = jwt.verify(match[1], process.env.JWT_SECRET, { algorithms: ['HS256'] });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
    return next();
}

router.post('/register', authController.register);
router.post('/login', authController.login);

router
    .route("/trips")
    .get(tripsController.tripsList)
    .post(authenticateJWT, tripsController.tripsAddTrip);

router
    .route('/trips/:tripCode')
    .get(tripsController.tripsFindByCode)
    .put(authenticateJWT, tripsController.tripsUpdateTrip);

module.exports = router;

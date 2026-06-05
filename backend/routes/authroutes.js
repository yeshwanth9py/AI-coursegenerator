const { Router } = require('express');
const { registerUser, loginUser, auth0Sync } = require('../controllers/authController');

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/auth0-sync', auth0Sync);

module.exports = router;

const {loginUser, registerUser} = require('../controllers/authcontroller');

const { Router } = require('express');
const { protect } = require('../middlewares/authmiddleware');
const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);


module.exports = router;
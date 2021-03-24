const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config');
const User = require('../../models/User');
const auth = require('../../middleware/auth');



// @route  GET api/auth
// @dec    nun
//@ access  private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json(user)

    }
    catch (err) {
        console.log(err.message);
        res.status(500).send('Server error')
    }
});

// @route  POST api/auth
// @dec    login user and get token
//@ access  public
router.post('/', [
    check('email', "Please enter Valid Email").isEmail(),
    check('password', "Password is required").exists()

], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { email, password } = req.body;

    try {

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credential' }] })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credential' }] })
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, config.get('jwtToken'), { expiresIn: 3600000 }, (err, token) => {
            if (err) throw err;
            res.json({ token })
        })

    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Internal server Error')
    }


});

module.exports = router;
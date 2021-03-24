const express = require('express');
const router = express.Router();

router.use('/api/users', require('./api/users'));
router.use('/api/auth', require('./api/auth'));
router.use('/api/posts', require('./api/posts'));
router.use('/api/profile', require('./api/profile'));

module.exports = router;
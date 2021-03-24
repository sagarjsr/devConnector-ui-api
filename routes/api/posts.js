const express = require('express')
const router =  express.Router();


// @route  GET api/post
// @dec    nun
//@ access  public
router.get('/', (req, res) =>{
    res.send('user posts')
});

module.exports= router;
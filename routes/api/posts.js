const express = require('express')
const router = express.Router();
const config = require('config');
const { check, validationResult } = require('express-validator')
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');


// @route  POST api/post
// @dec    nun
//@ access  private
router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const user = await User.findById(req.user.id).select('-password');

        newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })

        const post = await newPost.save();
        res.status(200).json(post);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });

    }

});

// @route  GET api/post
// @dec    Get all Posts
//@ access  private

router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });

        res.status(200).json(posts)

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// @route  GET api/post/:id
// @dec    Get  Posts by id 
//@ access  private

router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }
        res.status(200).json(post)

    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: "Post not found" });
        }
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// @route  DELETE api/post/:id
// @dec    DELETE  Posts by id 
//@ access  private

router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        // check on user
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User is not authorized' })
        }

        await post.remove();
        res.status(200).json({ msg: 'Post removed' })

    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: "Post not found" });
        }
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// @route  PUT api/post/like:id
// @dec    like a post  
//@ access  private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if the post has already been liked
        if (post.likes.some((like) => like.user.toString() === req.user.id)) {
            return res.status(400).json({ msg: 'Post already liked' });
        }

        post.likes.unshift({ user: req.user.id });

        await post.save();
        res.status(200).json(post.likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' })

    }
});

// @route  PUT api/post/like:id
// @dec    unlike a post  
//@ access  private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if the post has already been liked
        if (!post.likes.some((like) => like.user.toString() === req.user.id)) {
            return res.status(400).json({ msg: 'Post has not yer been like' });
        }

        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex, 1)
        await post.save();
        res.status(200).json(post.likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' })

    }
});

module.exports = router;
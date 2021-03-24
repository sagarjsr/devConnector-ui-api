const express = require('express');
const router = express.Router();
const request =  require('request')
const config = require('config');
const { check, validationResult } = require('express-validator')
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const auth = require('../../middleware/auth');
const { response } = require('express');


// @route  GET api/profile/me
// @dec    get current user profile
//@ access  private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await (await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']));

        if (!profile) {
            return res.status(400).json({ msg: "There is no profile for this user" })
        }

        res.status(200).json(profile)
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Server error')
    }
});

// @route  POST api/profile
// @dec    create of update profile
//@ access  private

router.post('/', [auth, [
    check('status', 'status is required').not().isEmpty(),
    check('skills', 'skills is required').not().notEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { company, website, location, bio, status, githubusername, skills, youtube, facebook, twitter, instagram, linkedin } = req.body;

    // Build profile object 
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) profileFields.skills = skills.split(',').map(skill => skill.trim());

    // build social object 
    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        //update
        if (profile) {
            profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
            return res.status(200).json(profile);
        }



        //create profile

        profile = new Profile(profileFields);
        await profile.save();
        res.status(200).json(profile)

    }
    catch (err) {
        console.error(err.message);
        res.status(500).send().json({ msg: "server Error" });
    }
});

// @route  GET api/profile
// @dec    get all Profile
//@ access  public

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar'])
        res.status(200).json(profiles)

    } catch (err) {
        console.error(err.message);
        res.status(500).send().json({ msg: "server Error" });
    }
});

// @route  GET api/profile/user/:user_id
// @dec    get  Profile by user id 
//@ access  public

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar'])

        if (!profile) {
            return res.status(400).json({ msg: "profile not found" });
        }
        res.status(200).json(profile)

    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: "profile not found" });
        }
        res.status(500).send().json({ msg: "server Error" });
    }
});

// @route  DELETE api/profile
// @dec    to delete  Profile, user, & Posts
//@ access  private
router.delete('/', auth, async (req, res) => {
    try {
        //remove user profile
        await Profile.findOneAndRemove({ user: req.user.id });
        await User.findOneAndRemove({ _id: req.user.id });
        res.status(200).json("user deleted")

    } catch (err) {
        console.error(err.message);
        res.status(500).send().json({ msg: "server Error" });
    }
});

// @route  PUT api/profile
// @dec    add profile experience
//@ access  private
router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
]], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { title, company, location, from, to, current, description } = req.body;
    const newExp = { title, company, location, from, to, current, description };
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.experience.unshift(newExp);
        await profile.save();
        res.status(200).json(profile)

    } catch (err) {
        console.error(err.message);
        res.status(500).send().json({ msg: "server Error" });
    }
});

// @route  DELETE api/profile/experience:exp_id
// @dec    to delete  profile experience
//@ access  private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        //remove user exp
        const profile = await Profile.findOne({ user: req.user.id });

        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex, 1);
        profile.save();
        res.status(200).json(profile)

    } catch (err) {
        console.error(err.message);
        res.status(500).send().json({ msg: "server Error" });
    }
});

// @route  PUT api/education
// @dec    add profile Education
//@ access  private
router.put('/education', [auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of study is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
]], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { school, degree, fieldofstudy, from, to, current, description } = req.body;
    const newEdu = { school, degree, fieldofstudy, from, to, current, description };
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.education.unshift(newEdu);
        await profile.save();
        res.status(200).json(profile)

    } catch (err) {
        console.error(err.message);
        res.status(500).send().json({ msg: "server Error" });
    }
});

// @route  DELETE api/profile/education:edu_id
// @dec    to delete  profile education
//@ access  private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        //remove user exp
        const profile = await Profile.findOne({ user: req.user.id });

        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        profile.education.splice(removeIndex, 1);
        profile.save();
        res.status(200).json(profile)

    } catch (err) {
        console.error(err.message);
        res.status(500).send().json({ msg: "server Error" });
    }
});

// @route  GET api/profile/github:username
// @dec    to get user repos from github
//@ access  public

router.get('/github/:username', async (req, res)=>{
try {
    const options= {
        uri:`https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
        method: 'GET',
        headers : {'user-agent':'node.js'}
    };
    request(options, (error, response, body)=>{
        if(error){
            console.log(error);
        }
        if(response.statusCode !== 200 ){
           return res.status(404).json({msg:'No Github profile found'})
        }
        res.status(200).json(JSON.parse(body));
    });

    
} catch (err) {
    console.error(err.message);
    res.status(500).send().json({ msg: "server Error" });
    
}
});

module.exports = router;
"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../middlewares");
const post_1 = require("../models/post");
const user_1 = require("../models/user");
const postRoute = (0, express_1.Router)();
//Create a post
postRoute.post('/create', middlewares_1.verifyToken, async (req, res) => {
    const _a = req.body, { user } = _a, rest = __rest(_a, ["user"]);
    try {
        const post = new post_1.Post(rest);
        if (user._id === rest.userId) {
            await post.save();
            res.status(200).json('Post created');
        }
        else {
            res.status(401).json('You are not authorized');
        }
    }
    catch (err) {
        res.status(500).json('err');
    }
});
//Edit a post
postRoute.put('/update', middlewares_1.verifyToken, async (req, res) => {
    const _a = req.body, { user } = _a, rest = __rest(_a, ["user"]);
    try {
        const post = await post_1.Post.findById(rest.postId);
        if (user._id === (post === null || post === void 0 ? void 0 : post.userId)) {
            await post_1.Post.findByIdAndUpdate(rest.postId, rest, { new: true });
            res.status(200).json('Post updated');
        }
        else {
            res.status(401).json('Unauthorized');
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json('Error');
    }
});
//Delete post
postRoute.delete('/delete', middlewares_1.verifyToken, async (req, res) => {
    const _a = req.body, { user } = _a, rest = __rest(_a, ["user"]);
    try {
        const post = await post_1.Post.findById(rest.postId);
        if ((post === null || post === void 0 ? void 0 : post.userId) === user._id) {
            await post_1.Post.findOneAndDelete(rest.postId);
            res.status(200).json('Post deleted');
        }
        else {
            res.status(500).json('You are not authorized');
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json('Error');
    }
});
//Get a post
postRoute.get('/find', async (req, res) => {
    const desc = req.body.description;
    const regex = new RegExp(desc, 'i');
    try {
        const results = await post_1.Post.find({ description: { $regex: regex } });
        res.status(200).json(results);
    }
    catch (err) {
        console.log(err);
        res.status(500).json('Error');
    }
});
//Add like
postRoute.put('/like', middlewares_1.verifyToken, async (req, res) => {
    const _a = req.body, { user } = _a, rest = __rest(_a, ["user"]);
    const postId = rest.postId;
    const userId = rest.userId;
    try {
        if (userId === user._id) {
            await post_1.Post.updateOne({ _id: postId }, { $push: { likes: userId } });
            res.status(200).json('Liked');
        }
        else {
            res.status(401).json("Unauthorized");
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json('Error');
    }
});
//Comment a post
postRoute.put('/comment', middlewares_1.verifyToken, async (req, res) => {
    const _a = req.body, { user } = _a, rest = __rest(_a, ["user"]);
    try {
        if (rest.userId === user._id) {
            await post_1.Post.updateOne({ _id: rest.postId }, { $push: { comments: { userId: user._id, comment: rest.comment } } });
            res.status(200).json('Comment posted');
        }
        else {
            res.status(401).json('Unauthorized');
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json('Error');
    }
});
//Get users timeline
postRoute.get('/timeline', async (req, res) => {
    const timeLinePosts = [];
    const userId = req.body.userId;
    const usersPost = await post_1.Post.find({ userId: userId });
    timeLinePosts.push(usersPost);
    const user = await user_1.User.findById(userId);
    const userFollowing = user === null || user === void 0 ? void 0 : user.following;
    //Loop through each user following, request their posts and push to timeline posts
    for (let i = 0; i < userFollowing.length; i++) {
        const eachUserPosts = await post_1.Post.find({ userId: userFollowing[i] });
        if (eachUserPosts.length > 0) {
            timeLinePosts.push(eachUserPosts);
        }
    }
    try {
        res.status(200).json(timeLinePosts);
    }
    catch (err) {
        console.log(err);
        res.status(500).json('Error');
    }
});
//Save a post
postRoute.put('/save', middlewares_1.verifyToken, async (req, res) => {
    const _a = req.body, { user } = _a, rest = __rest(_a, ["user"]);
    try {
        if (user._id === rest.userId) {
            await user_1.User.updateOne({ _id: user._id }, { $push: { savedPosts: rest.postId } });
            res.status(201).json('Post saved');
        }
        else {
            res.status(401).json('Unauthorized');
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json('Error');
    }
});
exports.default = postRoute;

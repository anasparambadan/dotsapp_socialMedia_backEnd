import PostModel from "../Models/postModel.js";
import UserModel from "../Models/userModel.js";
import ReportModel from "../Models/ReportModel.js"

import mongoose from "mongoose";

const ObjectId = mongoose.Types.ObjectId




//create new post

export const createPost = async (req, res) => {

    const newPost = new PostModel(req.body)

    try {

        await newPost.save()
        res.status(200).json(newPost)
    } catch (error) {
        res.status(500).json(error)

    }

};

//get a post 

export const getPost = async (req, res) => {
    const id = req.params.id
    try {
        const post = await PostModel.findById(id)
        res.status(200).json(post)
    } catch (error) {
        res.status(500).json(error)
    }
}

//Update a post

export const updatePost = async (req, res) => {
    const postId = req.params.id
    const { userId } = req.body

    try {
        const post = await PostModel.findById(postId)
        if (post.userId === userId) {
            await post.updateOne({ $set: req.body })
            res.status(200).json("Post Updated")
        }
        else {
            res.status(403).json("Action forbidden")
        }
    } catch (error) {
        res.status(500).json(error)
    }

};

//delete a post

export const deletePost = async (req, res) => {
    const postId = req.params.id
    const { userId } = req.body;

    try {
        const post = await PostModel.findById(postId)
        if (post.userId === userId) {
            await post.deleteOne()
            res.status(200).json("Post deleted")
        }

    } catch (error) {
        res.status(500).json(error)
    }

};

//Like and Dislike post

export const likePost = async (req, res) => {
    const postId = req.params.id
    const { userId } = req.body
    try {
        const post = await PostModel.findById(postId)
        if (!post.likes.includes(userId)) {
            await post.updateOne({ $push: { likes: userId } })
            res.status(200).json("Post liked")
        }
        else {
            await post.updateOne({ $pull: { likes: userId } })
            res.status(200).json("Post Unliked")
        }
    } catch (error) {
        res.status(500).json(error)
    }

};


//comment post

export const commentPost = async (req, res) => {
    const postId = req.params.id
    // console.log(req.body,"user id for co;mmmment");
    const { userId, userComment } = req.body.commentData
    try {


        const userinfo = ObjectId(userId)

        // console.log(userId, userComment)
        const newComment = { userId: userinfo, userComment, createdAt: Date.now() }
        const post = await PostModel.findOneAndUpdate({ _id: postId }, { $push: { comment: newComment } })
        // const post = await PostModel.findById(postId)
        // await post.updateOne({$push:{f
        //     comment.
        // }})
        // console.log("posrt for comment", post);
        res.status(200).json(post)

    } catch (error) {
        res.status(500).json(error)
    }
}


//get post comments

export const getPostComments = async (req, res) => {
    const postId = req.params.id;
    console.log(postId, 'postid at getpostcommetns................')
    try {

        const postComments = await PostModel.aggregate([
            {
                $match: {
                    _id: new ObjectId(postId)
                }
            }, {
                $unwind: {
                    path: '$comment'
                }
            }, {
                $lookup: {
                    from: 'users',
                    localField: 'comment.userId',
                    foreignField: '_id',
                    as: 'userData'
                }
            }, {
                $project: {
                    "userData.firstName": 1,
                    "userData.lastName": 1,
                    "userData.profilePicture": 1,
                    "comment.userComment": 1,
                    "comment.createdAt": 1
                }
            }, {
                $unwind: {
                    path: '$userData'
                }
            }, {
                $sort: {
                    'comment.createdAt': -1
                }
            }
        ])
        console.log(postComments, 'post comments on getpost comments')
        res.status(200).json(postComments)
    }

    catch (error) {

    }
}

//get timeline post

export const getTimlinePosts = async (req, res) => {
    const userId = req.params.id
    console.log(userId, 'userId at postcontroller;.......')
    try {
        const timelinePosts = await UserModel.aggregate([
            {
                $match: {
                    _id: ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "following",
                    foreignField: "userId",
                    as: "followingPosts",
                },
            },
            {
                $addFields: {
                    stringId: {
                        $toString: "$_id",
                    },
                },
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "stringId",
                    foreignField: "userId",
                    as: "myPosts",
                },
            },
            {
                $project: {
                    _id: 0,
                    allposts: {
                        $concatArrays: ["$myPosts", "$followingPosts"],
                    },
                },
            },
            {
                $unwind: {
                    path: "$allposts",
                },
            },
            {
                $addFields: {
                    objId: {
                        $toObjectId: "$allposts.userId",
                    },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "objId",
                    foreignField: "_id",
                    as: "userData",
                    pipeline: [
                        {
                            $project: {
                                _id: 0,
                                userName: 1,
                                firstName: 1,
                                lastName: 1,
                                profilePicture: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: {
                    path: "$userData",
                },
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ["$userData", "$allposts"],
                    },
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
        ]);
        //console.log(currentUserPosts,'---------currentUserPosts')
        console.log(timelinePosts, 'time line posts.........');
        const realpost = timelinePosts.filter((post) => {
            return !post.isRemoved
        })
        console.log(realpost, 'realpost................')

        res.status(200).json(realpost);
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}


export const reportPost = async (req, res) => {

    const postId = req.params.id
    const { userId } = req.body

    console.log(postId, userId, 'postId and usr id at reqport post controller.........')

    const { desc } = req.body;
    const user = { userId, desc };

    try {
        const report = await ReportModel.findOne({ postId });
        if (report) {
            report.users.push(user);
            report.save();
            res.status(200).json('Post reported Successfully')
        } else {
            const report = await ReportModel.create({ users: user, postId });
            console.log(report);
            res.status(200).json('Post reported Successfully')
        }
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }

};

export const getReportedPost = async (req, res) => {
    const posts = await ReportModel.find().populate("postId").populate("users.userId")

    try {
        if (posts) {
            res.status(200).json(posts)
        }
        else {
            res.status(200).json('No posts')
        }

    } catch (error) {
        res.status(500).json(error)

    }


}

export const removePost = async (req, res) => {
    const postId = req.params.id
    const { userId } = req.body
    const user = await UserModel.findById(userId)
    console.log(user, 'user at removepost')
    console.log(userId, postId, 'userid,isadminnn,postid...........at controller.....')
    const post = await PostModel.findById(postId)
    console.log(post, 'post at removepost post controller..................')

    try {
        console.log(user.isAdmin, 'usr.isadmin............')
        if (post.userId === userId || user.isAdmin) {
            if (post.isRemoved) {
                const posts = await PostModel.updateOne({ _id: postId }, { isRemoved: false });
                await ReportModel.deleteOne({postId:postId})
                res.status(200).json(posts)
            }
            else {
                const posts = await PostModel.updateOne({ _id: postId }, { isRemoved: true });
                res.status(200).json(posts)
            }

           
        }
    } catch (error) {
        res.status(500).json(error)

    }

}


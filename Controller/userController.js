import UserModel from "../Models/userModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

//get all users

export const getAllUsers = async (req, res) => {
    const id = req.params.id;


    try {
        let users = await UserModel.find({isAdmin:false});

        users = users.map((user) => {
            const { password, ...otherDetails } = user._doc
            return otherDetails
        })
        res.status(200).json(users)

    } catch (error) {
        res.status(500).json(error)

    }
};



//get a user

export const getUser = async (req, res) => {
    const id = req.params.id;


    try {
        const user = await UserModel.findById(id);
        if (user) {

            const { password, ...otherDetails } = user._doc
            res.status(200).json(otherDetails)
        }
        else {
            res.status(404).json("No user found")
        }

    } catch (error) {
        res.status(500).json(error)

    }
};

//update user

export const updateUser = async (req, res) => {
    const id = req.params.id;
    const { _id, password } = req.body;

    if (id === _id) {
        try {

            if (password) {
                console.log("password present")

                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(password, salt)

            }

            const user = await UserModel.findByIdAndUpdate(id, req.body, { new: true })
            const token = jwt.sign(
                { userName: user.userName, id: user._id },
                process.env.JWT_KEY,
                { expiresIn: "1h" }
            );
            console.log(user, 'user at update user')
            res.status(200).json({ user, token })

        } catch (error) {
            res.status(500).json(error)

        }
    }
    else {
        res.status(403).json("Access Denied!")
    }
};


//Delete user

export const deleteUser = async (req, res) => {
    const id = req.params.id

    const { currentUserId, currentUserAdminStatus } = req.body
    if (currentUserId === id || currentUserAdminStatus) {
        try {
            await UserModel.findByIdAndDelete(id)
            res.status(200).json("User deleted successfully")

        } catch (error) {
            res.status(500).json(error)
        }
    }
    else {
        res.status(403).json("Access Denied!")
    }
}


//follow user

export const followUser = async (req, res) => {
    const id = req.params.id

    const { _id } = req.body

    if (_id === id) {
        res.status(403).json("Action forbidden")
    }
    else {
        try {
            const followUser = await UserModel.findById(id)
            const followingUser = await UserModel.findById(_id)
            if (!followUser.followers.includes(_id)) {
                await followUser.updateOne({ $push: { followers: _id } })
                await followingUser.updateOne({ $push: { following: id } })
                res.status(200).json("User followed")
            }
            else {
                res.status(403).json("You alrady follow this dot")
            }

        } catch (error) {
            res.status(500).json(error)
        }
    }
}

//Unfollow user

export const unFollowUser = async (req, res) => {
    const id = req.params.id
    // console.log(id, 'person id at usr cntoller unfollow.............')

    const { _id } = req.body

    // console.log(_id,' user id at unfollow user controller')

    if (_id === id) {
        res.status(403).json("Action forbidden")
    }
    else {
        try {
            const followUser = await UserModel.findById(id)
            console.log(followUser, 'followuser or person data at unfollow user controller')
            const followingUser = await UserModel.findById(_id)
            console.log(followingUser, 'following or user data  at unfollow user controller')
            if (followUser.followers.includes(_id)) {
                await followUser.updateOne({ $pull: { followers: _id } })
                await followingUser.updateOne({ $pull: { following: id } })
                res.status(200).json("User unfollowed")
            }
            else {
                res.status(403).json("You are not connected with this dot")
            }

        } catch (error) {
            res.status(500).json(error)
        }
    }
}


//search users

export const searchUsers = async (req, res) => {
    // console.log('---------------------------+++++-----------')
    const { keyWord } = req.body
    // console.log(keyWord, "keyword..........")
    try {
        let findUser = await UserModel.find({
            firstName: { $regex: new RegExp(keyWord), $options: "si" }
        });
        // console.log(findUser,'finduser firest')
            findUser = findUser.map((item) => {
                const { password, verified, isAdmin, ...otherDetails } = item._doc
                return otherDetails;
            })
            res.status(200).json(findUser)  
    } catch (error) {
        res.status(500).json(error)
    }
}

export const blockUser = async (req, res) => {
    const userId = req.params.id
    const user = await UserModel.findById(userId)

    try {
        if (user.isBlocked) {
            await UserModel.updateOne({ _id: userId }, { isBlocked: false });
            res.status(200).json('User blocked successfully')

        }
        else {
            await UserModel.updateOne({ _id: userId }, { isBlocked: true });
            res.status(200).json('User Un-blocked successfully')

        }



    } catch (error) {
        res.status(500).json(error)

    }
}

import express from 'express'
import { blockUser, deleteUser, followUser, getAllUsers, getUser, searchUsers, unFollowUser, updateUser } from '../Controller/userController.js';
import authMiddleWare from '../middleWare/authMiddleWare.js';

const router = express.Router();

router.get('/',getAllUsers)
router.get('/:id',getUser)
router.put('/:id',authMiddleWare, updateUser)
router.delete('/:id',authMiddleWare,deleteUser)
router.put('/:id/follow', authMiddleWare,followUser)
router.put('/:id/unfollow',authMiddleWare, unFollowUser)
router.post('/search-user', searchUsers)
router.put('/:id/block',blockUser)

export default router;
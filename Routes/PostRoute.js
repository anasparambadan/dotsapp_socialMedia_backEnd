import express from "express";


import { commentPost, createPost, deletePost, getPost, getPostComments, getReportedPost, getTimlinePosts, likePost, removePost, reportPost, updatePost } from "../Controller/postController.js";

const router = express.Router()

router.post('/', createPost)
router.get('/:id',getPost)
router.put('/:id',updatePost)
router.delete('/:id',deletePost)
router.put('/:id/like', likePost)
router.get('/:id/timeline',getTimlinePosts)
router.put('/:id/comment',commentPost)
router.get('/:id/postComments', getPostComments)
router.post('/:id',deletePost)
router.post('/:id/remove',removePost)
router.post('/:id/report',reportPost)
router.get('/get/reported',getReportedPost)


export default router;

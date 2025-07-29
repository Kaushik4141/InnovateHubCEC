import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deletePost,
  getAllPost,
  getPostById,
  togglePublishStatus,
  updatePost,
  postUpload,
  getCombinedPosts,
} from "../controllers/post.controller.js";
import {
   linkpostUpload,
   getlinkedinPosts
  } from "../controllers/linkedinpost.controller.js";
const router = Router();
router.route("/uploadPost").post(
  verifyJWT,
  upload.fields([
    { name: "postFile", maxCount: 1 },
  ]),
  postUpload
);
router.route("/postId/:postId").get(getPostById);
router
  .route("/postId/:postId")
  .patch(upload.single("postFile"), updatePost);
router.route("/postId/:postId").delete(deletePost);
router.route("/postId/:postId").post(togglePublishStatus);
router.route("/getAllPost").get(getAllPost);
router.route("/linkedinpost").post(verifyJWT, linkpostUpload);
router.route("/combinedPosts").get(verifyJWT, getCombinedPosts);
router.route("/linkedinPosts").get(verifyJWT, getlinkedinPosts);


export default router;
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
} from "../controllers/post.controller.js";
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
export default router;
import { Router } from "express";
import { registerUser, loginuser, logoutUser, refreshAccessToken, updateUserAvatar, updateAccountDetails, getcurrentUser,getUserProfile ,changeCurrrentPassword,alive,getNotifications,requestFollow,acceptFollow,rejectFollow, searchUsers, getUserMin} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router= Router()
router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverimage", maxCount: 1 }
    ]),
    registerUser);
router.route("/login").post(loginuser);
router.route("/alive").get(alive);


router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post( refreshAccessToken);
router.route("/change_Password").post(verifyJWT,changeCurrrentPassword)
router.route("/current-user").get(verifyJWT, getcurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

router.route("/c/:fullname").get(verifyJWT, getUserProfile)
router.route("/notifications").get(verifyJWT, getNotifications)
router.route("/:id/request-follow").post(verifyJWT, requestFollow)
router.route("/:id/accept-follow").post(verifyJWT, acceptFollow)
router.route("/:id/reject-follow").post(verifyJWT, rejectFollow)
router.route("/search").get(verifyJWT, searchUsers)
router.route("/min/:id").get(verifyJWT, getUserMin)


    
export default router
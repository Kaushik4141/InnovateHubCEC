import { Router } from "express";
import { registerUser, loginuser, logoutUser, refreshAccessToken, updateUserAvatar, updateAccountDetails, getcurrentUser,getUserProfile ,changeCurrrentPassword} from "../controllers/user.controller.js";
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

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post( refreshAccessToken);
router.route("/change_Password").post(verifyJWT,changeCurrrentPassword)
router.route("/current-user").get(verifyJWT, getcurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

router.route("/c/:fullname").get(verifyJWT, getUserProfile)


    
export default router
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  listRooms,
  getRoomMessages,
  getPrivateMessages,
  uploadChatFile,
  getPrivateContacts,
  getOrCreateChatThread,
  reactToMessage,
  pinMessage,
  unpinMessage,
} from "../controllers/chat.controller.js";

const router = Router();
router.get("/rooms", verifyJWT, listRooms);
router.get("/rooms/:roomId/messages", verifyJWT, getRoomMessages);

router.get("/private/:userId/messages", verifyJWT, getPrivateMessages);
router.get("/private/contacts", verifyJWT, getPrivateContacts);
router.get("/private/:userId/thread", verifyJWT, getOrCreateChatThread);

router.post("/messages/:messageId/react", verifyJWT, reactToMessage);
router.post("/messages/:messageId/pin", verifyJWT, pinMessage);
router.post("/messages/:messageId/unpin", verifyJWT, unpinMessage);

router.post("/upload", verifyJWT, upload.single("file"), uploadChatFile);

export default router;

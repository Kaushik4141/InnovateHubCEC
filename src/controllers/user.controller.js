import { asyncHandler } from "../utils/asynchandler.js";
const registerUser = asyncHandler(async (req, res) => {
    resstatus(200).json({
        message: "User registration endpoint",
})
})
export { registerUser }
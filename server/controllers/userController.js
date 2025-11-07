import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        return res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified
            }
        })

    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}
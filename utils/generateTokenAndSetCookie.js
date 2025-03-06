const jwt = require("jsonwebtoken");

const generateTokenAndSetCookie = (res, id) => {
    const token = jwt.sign({ id }, process.env.SECRET, {
        expiresIn: "7d",
    });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Only secure in production
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Lax for local dev
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/" // Ensure cookie is available across all paths
        // Remove domain attribute completely - let browser handle it
    });
    return token;
};

module.exports = { generateTokenAndSetCookie };

const jwt = require("jsonwebtoken");

const generateTokenAndSetCookie = (res, id) => {
    const token = jwt.sign({ id }, process.env.SECRET, {
        expiresIn: "7d",
    });

    // Manually set the "Set-Cookie" header with "Partitioned" attribute
    res.setHeader("Set-Cookie", `token=${token}; HttpOnly; Secure; SameSite=None; Partitioned; Max-Age=86400; Path=/`);

    return token;
};

module.exports = { generateTokenAndSetCookie };
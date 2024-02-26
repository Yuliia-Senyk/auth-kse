const jwt = require("jsonwebtoken");
const secretKey = require("../secret-key");

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).redirect('/login');
    }
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).redirect('/login');
        }
        req.user = decoded;
        console.log(req.user, 'user')
        next();
    });
};

module.exports = verifyToken;
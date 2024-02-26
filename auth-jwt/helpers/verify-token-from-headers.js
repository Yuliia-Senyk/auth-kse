const jwt = require("jsonwebtoken");
const secretKey = require("../secret-key");
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).redirect('/login');
    }
    if (token.startsWith('Bearer ')) {
        console.log('verifyToken startsWith', token)

        const tokenWithoutBearer = token.slice(7);
        jwt.verify(tokenWithoutBearer, secretKey, (err, decoded) => {
            if (err) {
                return res.status(403).redirect('/login');
            }
            req.user = decoded;
            console.log(req.user, 'user')
            next();
        });
    }
    else {
        res.status(401).send('Invalid token format');
    }
};

module.exports = verifyToken;
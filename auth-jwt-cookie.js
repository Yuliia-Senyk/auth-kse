const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3333;

app.set('view engine', 'pug');
app.set('views', 'views-jwt');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

const secretKey = 'your-secret-key';

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

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === 'user' && password === 'password') {
        const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
        res.cookie('token', token);
        res.redirect('/protected');
    } else {
        res.status(401).json({ message: 'Authentication failed' });
    }
});


app.get('/protected', verifyToken, (req, res) => {
    res.render('protected', { user: req.user });
});


app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

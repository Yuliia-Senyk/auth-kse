const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const verifyToken = require('./helpers/verify-token');
const secretKey = require("./secret-key");

const app = express();
const port = 3003;

app.set('view engine', 'pug');
app.set('views', 'views-jwt');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());


app.get('/login', (req, res) => {
    res.render('login-cookies');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === 'user' && password === 'password') {
        const token = jwt.sign({ username: username }, secretKey, { expiresIn: '1h' });
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
    res.render('home');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

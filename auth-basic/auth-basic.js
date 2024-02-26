const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const PORT = 3002;

const app = express();
const persons = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'pug');
app.set('views', 'views');

app.use(session({ secret: 'my-secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 30000, // 30 secs
        httpOnly: true
    }}));


const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

const sendProtectedData = (req, res, next) => {
    res.render('protected', {user: req.session.username});
}

async function hashPassword(password) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error.message);
        throw error;
    }
}

app.get('/', (req, res) => {
    res.redirect('users');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/users', (req, res) => {
    res.render('users', {users: persons, currentUser: req.session.username});
});


app.post('/register', async (req, res) => {
    const { username, password } = req.body;
     try  {
        const hashedPassword = await hashPassword(password);
        const newUser = { id: persons.length + 1, username, password: hashedPassword };
        persons.push(newUser);
        res.redirect('/login');
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/login', async (req, res) => {
    console.log('/login', req.body)
    const { username, password } = req.body;
    const person = persons.find((p) => p.username === username);

    if (!person || !(await bcrypt.compare(password, person.password))) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }
    const expirationTime = new Date(Date.now() + 10 * 1000);
    res.cookie('username', username, { expires: expirationTime });
    res.cookie('password', password, { expires: expirationTime });

    req.session.userId = person.id;
    req.session.username = person.username;
    res.redirect('protected');
});


app.get('/logout', requireLogin, (req, res) => {
    console.log('logout')
    req.session.destroy(() => {
        res.json({ message: 'Logout successful' });
        res.clearCookie('userId');
        res.clearCookie('username');
    });
});

app.get('/protected', requireLogin, sendProtectedData);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

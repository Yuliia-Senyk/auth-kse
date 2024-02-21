const express = require('express');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const session = require('express-session');

const app = express();

app.use(session({ secret: 'my-key', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use(new FacebookStrategy({
        clientID: '1944495622689870',
        clientSecret: '832202a9999d96352252691b3a8f7785',
        callbackURL: 'http://localhost:3000/auth/facebook/callback',
    },
    (accessToken, refreshToken, profile, done) => {
    console.log({accessToken, refreshToken, profile})
        return done(null, profile);
    }));

app.get('/', (req, res) => {
    res.send('Home');
});

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/');
    });


app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

app.get('/profile', isAuthenticated, (req, res) => {
    res.send(`Welcome, ${req.user.displayName}!`);
});

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/facebook');
}

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

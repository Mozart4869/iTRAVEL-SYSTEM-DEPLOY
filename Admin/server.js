const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files (including HTML files)
app.use(express.static(path.join(__dirname, 'public')));

// Dummy user data for authentication (replace with real user validation)
const users = {};

// Register endpoint
app.post('/register', (req, res) => {
    const { name, email, password, confirm-password } = req.body;

    if (!users[email]) {
        if (password === confirm-password) {
            users[email] = { name, password };
            res.redirect('/login.html');
        } else {
            res.status(400).send('Passwords do not match');
        }
    } else {
        res.status(409).send('User already exists');
    }
});

// Login endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (users[email] && users[email].password === password) {
        req.session.user = { email, name: users[email].name };
        res.redirect('/dashboard.html');
    } else {
        res.status(401).send('Invalid credentials');
    }
});

// Dashboard endpoint (protected route)
app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    } else {
        res.redirect('/login.html');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files (including HTML files)
app.use(express.static(path.join(__dirname, 'public')));

// Dummy user storage (in-memory, replace with a database in production)
const users = {};

// Register endpoint
app.post('/register', async (req, res) => {
    const { name, email, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        return res.status(400).send('Passwords do not match');
    }

    if (users[email]) {
        return res.status(409).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users[email] = { name, password: hashedPassword };

    res.redirect('/login.html');
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = users[email];
    if (!user) {
        return res.status(401).send('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).send('Invalid credentials');
    }

    req.session.user = { email, name: user.name };
    res.redirect('/dashboard.html');
});

// Protected route for dashboard
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login.html');
    }
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const dotenv = require('dotenv');
const app = express();
const auth = require('./middleware/auth');




// Load environment variables from .env file
dotenv.config();

// Use environment variables
const PORT = process.env.PORT || 3015;
const MONGO_URI = process.env.MONGO_URI;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key';

// Middleware
// Middleware to parse URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // To handle JSON payloads

// Serve static files from 'public' directory
app.use(express.static('public'));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Session management
app.use(session({

secret: SESSION_SECRET,
resave: false,
saveUninitialized: true,
}));
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Flash messages
app.use(flash());

// Global variables for flash messages
app.use((req, res, next) => {

res.locals.success_msg = req.flash('success_msg');
res.locals.error_msg = req.flash('error_msg');
next();
});


// Database connection
mongoose.connect(MONGO_URI)

.then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err));

// Passport configuration
const User = require('./models/user');
passport.use(new LocalStrategy(
async (username, password, done) => {
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        if (user.password !== password) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}
));
passport.serializeUser((user, done) => {
done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
try {
    const user = await User.findById(id);
    done(null, user);
} catch (err) {
    done(err);
}
});
// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/seller', require('./routes/seller'));
app.use('/product', require('./routes/product'));
app.use('/customization', require('./routes/customization'));
app.use('/order', require('./routes/order'));
app.use('/cart', require('./routes/cart'))



// Start the server
app.listen(PORT, () => {

    console.log(`Server running at: http://localhost:${PORT}`);

});

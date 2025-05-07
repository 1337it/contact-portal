const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/contact_portal', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// User model
const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String,
    name: String,
    phone: String,
    company: String,
    website: String,
});
const User = mongoose.model('User', UserSchema);

// Auth routes
app.post('/api/signup', async (req, res) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created' });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
});

app.get('/api/profile', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

app.put('/api/profile', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByIdAndUpdate(decoded.userId, req.body, { new: true });
        res.json(user);
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// VCF generation endpoint
app.get('/vcf/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).send('User not found');

    const vcf = `BEGIN:VCARD
VERSION:3.0
FN:${user.name}
EMAIL:${user.email}
TEL:${user.phone}
ORG:${user.company}
URL:${user.website}
END:VCARD`;

    res.setHeader('Content-Type', 'text/vcard');
    res.setHeader('Content-Disposition', `attachment; filename="${user.name}.vcf"`);
    res.send(vcf);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

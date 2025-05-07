const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.get('/:email/vcf', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).send('User not found');

    const vcf = `BEGIN:VCARD
VERSION:3.0
FN:${user.fullName}
ORG:${user.company}
TITLE:${user.jobTitle}
EMAIL:${user.email}
URL:${user.website}
ADR:${user.address}
END:VCARD`;

    res.setHeader('Content-Type', 'text/vcard');
    res.send(vcf);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;

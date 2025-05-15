const express = require('express');
const { createContactController } = require('../controllers/contact.controller'); // Gọi controller

const router = express.Router();

router.post('/', createContactController); // Gọi controller khi có request POST

module.exports = router;

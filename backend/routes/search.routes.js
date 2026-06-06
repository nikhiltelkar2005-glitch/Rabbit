const express = require('express');
const { searchQuery } = require('../controllers/search.controller');

const router = express.Router();

router.route('/')
  .get(searchQuery);

module.exports = router;

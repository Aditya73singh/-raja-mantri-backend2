// routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.post('/game/create', gameController.createGame);
router.get('/room/:roomId', gameController.getRoomDetails);

module.exports = router;

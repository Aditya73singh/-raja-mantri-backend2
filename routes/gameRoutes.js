// routes/gameRoutes.js
const express = require('express');
const { createGame, joinGame } = require('../controllers/gameController');
const router = express.Router();

router.post('/create', createGame);
router.post('/join', joinGame);

// You might later add more routes (e.g. for making guesses, updating game state, etc.)
// router.get('/:gameId', getGameState);
// router.post('/guess', makeGuess);

module.exports = router;

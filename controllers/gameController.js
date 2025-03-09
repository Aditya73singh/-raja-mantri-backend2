// controllers/gameController.js
const Game = require('../models/Game');
const Player = require('../models/Player');

// Helper function: assign starting score based on role.
const getScoreForRole = role => {
  switch (role) {
    case 'Mantri':
      return 900;
    case 'Chor':
      return 0;
    case 'Sipahi':
      return 700;
    // For additional roles, adjust appropriately.
    default:
      return 500;
  }
};

// POST /api/game/create
const createGame = async (req, res) => {
  const { gameName } = req.body;
  try {
    const game = new Game({ name: gameName, players: [] });
    const savedGame = await game.save();
    res.status(201).json(savedGame);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/game/join
const joinGame = async (req, res) => {
  const { gameId, playerName } = req.body;
  try {
    const game = await Game.findById(gameId);
    if (!game) return res.status(404).json({ error: 'Game not found' });

    // For a 4-player game, assign roles in a predetermined order.
    const availableRoles = ['Mantri', 'Chor', 'Sipahi', 'Neutral']; // "Neutral" as an extra role if needed
    const roleIndex = game.players.length; // This assumes players join sequentially
    const assignedRole = availableRoles[roleIndex] || 'Neutral';

    const player = new Player({
      name: playerName,
      role: assignedRole,
      score: getScoreForRole(assignedRole),
      game: game._id
    });
    await player.save();

    game.players.push(player._id);
    await game.save();

    res.status(201).json({ player, game });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createGame, joinGame };

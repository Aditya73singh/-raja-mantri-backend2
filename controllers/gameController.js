// controllers/gameController.js
const Room = require('../models/Room');

exports.createGame = async (req, res) => {
  try {
    const { playerIds } = req.body;
    if (!playerIds || playerIds.length !== 4) {
      return res.status(400).json({ error: 'Exactly 4 player IDs required' });
    }

    const roomCode = generateRoomId();
    const room = new Room({ roomCode, players: playerIds.map(id => ({ username: id })) });
    await room.save();

    res.status(201).json({ roomId: roomCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRoomDetails = async (req, res) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.roomId });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

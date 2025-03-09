// models/Player.js
const mongoose = require('mongoose');

const playerSchema = mongoose.Schema({
  name: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ['Mantri', 'Chor', 'Sipahi', 'King', 'Soldier', 'Thief', 'Minister', 'Queen', 'Villager']
  },
  score: { type: Number, default: 0 },
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' }
});

module.exports = mongoose.model('Player', playerSchema);

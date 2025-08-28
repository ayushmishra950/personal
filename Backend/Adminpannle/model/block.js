const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true, // User ID of the blocked user
  },
}); 

const Block = mongoose.model('Block', blockSchema);         

module.exports = Block;
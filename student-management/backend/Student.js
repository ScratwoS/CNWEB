const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0 },
    class: { type: String, required: true, trim: true }
  },
  {
    // Theo yêu cầu, collection tên "web"
    collection: 'web',
    timestamps: true
  }
);

module.exports = mongoose.model('Student', studentSchema);

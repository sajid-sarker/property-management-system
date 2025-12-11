const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  model: { type: String, required: true, unique: true },
  sequenceValue: { type: Number, default: 0 },
});

Counter = mongoose.model("Counter", counterSchema);
export default Counter;
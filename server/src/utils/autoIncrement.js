import Counter from "../models/Counter.js";

/**
 * Helper function to get the next sequence number for a model.
 */
async function getNextSequence(modelName) {
  const counter = await Counter.findOneAndUpdate(
    { model: modelName },
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true }
  );
  return counter.sequenceValue;
}

/**
 * Auto-increment plugin.
 * @param {Object} options - Options object
 * @param {String} options.field - The schema field that will store the ID.
 * @param {String} options.prefix - The prefix to prepend (e.g., "USR-", "PROP-").
 * @param {Number} options.padLength - Total digits to pad sequence with.
 */
function autoIncrementPlugin(schema, options) {
  const { field, prefix, padLength = 6 } = options;

  // Using async/await without next() for Mongoose 8.x compatibility
  schema.pre("save", async function () {
    // Prevent regenerating ID if it already exists
    if (!this[field]) {
      const nextId = await getNextSequence(prefix);
      const padded = String(nextId).padStart(padLength, "0");
      this[field] = `${prefix}${padded}`;
    }
  });
}

export default autoIncrementPlugin;

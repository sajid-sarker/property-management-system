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
 * @param {String} fieldName - The schema field that will store the ID.
 * @param {String} prefix - The prefix to prepend (e.g., "USR-", "PROP-").
 * @param {Number} padLength - Total digits to pad sequence with.
 */

function autoIncrementPlugin(fieldName, prefix, padLength = 6) {
  return function (schema) {
    schema.pre("save", async function (next) {
      try {
        // Prevent regenerating ID if it already exists
        if (!this[fieldName]) {
          const nextId = await getNextSequence(prefix);
          const padded = String(nextId).padStart(padLength, "0");

          this[fieldName] = `${prefix}${padded}`;
        }
        next();
      } catch (err) {
        next(err);
      }
    });
  };
}

export default autoIncrementPlugin;

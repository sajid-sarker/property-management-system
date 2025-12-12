import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
    wishlistId: {
      type: String,
      unique: true,
    },
})

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;
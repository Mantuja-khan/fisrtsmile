import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
);

const Blacklist = mongoose.model("Blacklist", blacklistSchema);
export default Blacklist;

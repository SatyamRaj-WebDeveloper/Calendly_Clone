import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  accessToken: { type: String }, 
  refreshToken: { type: String },
  timeZone: {
    type: String,
    default: "UTC",
  },
  availability: {
    type: [
      {
        dayOfWeek: { type: Number, min: 0, max: 6 }, 
        startTime: { type: String, default: "09:00" }, 
        endTime: { type: String, default: "17:00" }    
      }
    ],
    default: [1, 2, 3, 4, 5].map(day => ({ dayOfWeek: day, startTime: "09:00", endTime: "17:00" }))
  }
}, { timestamps: true });


const User = models.User || mongoose.model("User", userSchema);
export default User;
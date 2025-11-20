import mongoose from "mongoose";
import ROLES from "../constants/roles.ts";

// interface for the User document
interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: (typeof ROLES)[keyof typeof ROLES]; // 'admin' | 'member'
  createdAt?: Date;
  updatedAt?: Date;
}

// Helper function to capitalize first letter
const capitalizeFirstLetter = (cap: string) =>
  cap.charAt(0).toUpperCase() + cap.slice(1).toLowerCase();

// Regex: Only allows alphabetic characters
const nameRegex = /^[A-Za-z]+$/;

// Define the schema
const userSchema = new mongoose.Schema<IUser>(
  {
    firstname: {
      type: String,
      required: true,
      validate: {
        validator: (name: string) => nameRegex.test(name),
        message: (props) =>
          `${props.value} is not a valid first name. Only alphabetic characters are allowed.`,
      },
      set: capitalizeFirstLetter,
    },
    lastname: {
      type: String,
      required: true,
      validate: {
        validator: (name: string) => nameRegex.test(name),
        message: (props) =>
          `${props.value} is not a valid last name. Only alphabetic characters are allowed.`,
      },
      set: capitalizeFirstLetter,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: [...Object.values(ROLES)],
      default: ROLES.ADMIN,
    },
  },
  { timestamps: true }
);

// Create the model
const User = mongoose.model<IUser>("User", userSchema);

export default User;

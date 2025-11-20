import mongoose from "mongoose";

// interface for the Booking document
interface IBooking extends mongoose.Document {
  userId: mongoose.Schema.Types.ObjectId; // Reference to User
  housingId: mongoose.Schema.Types.ObjectId; // Reference to Housing
  startDate: Date;
  endDate: Date;
  guests: {
    adults: number;
    kids: number;
    animals: number;
  };
  totalPrice: number;
  perNightPrice: number;
  createdAt?: Date;
}

// Booking schema
const bookingSchema = new mongoose.Schema<IBooking>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    housingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Housing",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    guests: {
      adults: { type: Number, required: true },
      kids: { type: Number, required: true },
      animals: { type: Number, required: true },
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    perNightPrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Create the model
const Booking = mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;

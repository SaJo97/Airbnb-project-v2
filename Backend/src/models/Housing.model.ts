import mongoose from "mongoose";

interface IHousing extends mongoose.Document {
  createdBy: mongoose.Schema.Types.ObjectId; // Reference to User
  title: string;
  description: string;
  location: string;
  availableDates: { start: Date; end: Date }[]; // array of available dates
  maxAdults: number;
  maxKids: number;
  maxAnimals: number; // dogs
  prices: {
    adult: number;
    kid: number;
    animal: number;
    housing: number;
  };
  totalPrice: number;
  type: string; // apartment, house
  place: string; // in forest, near lake
  coords: {
  lat: Number,
  lon: Number,
},
  nearActivities: {
    description: string;
    activities: { name: string; location: string }[];
    coords: {
        lat: Number,
        lon: Number,
      },
  };
  petFriendly: boolean; // dog friendly
  images: string[]; // array of images
  isAvailable: boolean; // flag to hide fully booked housings
  rating: {
    average: number;
    count: number;
  };
  rules: string[];
  bedrooms: number;
  rooms: number;
  beds: number;
}

const HousingSchema = new mongoose.Schema<IHousing>(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    availableDates: [
      {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
      },
    ],
    maxAdults: { type: Number, required: true },
    maxKids: { type: Number, required: true },
    maxAnimals: { type: Number, required: true },
    // price: { type: Number, required: true },
    prices: {
      adult: { type: Number, required: true, min: 0 },
      kid: { type: Number, required: true, min: 0 },
      animal: { type: Number, required: true, min: 0 },
      housing: { type: Number, required: true, min: 0 },
    },
    totalPrice: { type: Number, required: true }, // total = sum of all 4 prices
    type: { type: String, required: true },
    place: { type: String, required: true },
    coords: {
      lat: { type: Number },
      lon: { type: Number },
    },
    nearActivities: {
      description: { type: String, required: true },
      activities: [
        {
          name: { type: String, required: true },
          location: { type: String, required: true }, // e.g. "Bodasjön, Sweden"
          coords: {
            lat: Number,
            lon: Number,
          },
        },
      ],
    },
    petFriendly: { type: Boolean, required: true },
    images: { type: [String], required: true },
    isAvailable: { type: Boolean, default: true },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
    rules: { type: [String], default: [] },
    bedrooms: { type: Number, default: 1, min: 0 },
    rooms: { type: Number, default: 1, min: 0 },
    beds: { type: Number, default: 1, min: 0 },
  },
  { timestamps: true }
);

const Housing = mongoose.model<IHousing>("Housing", HousingSchema);

export default Housing;

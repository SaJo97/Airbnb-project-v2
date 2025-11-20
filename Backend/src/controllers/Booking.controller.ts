import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Booking from "../models/Booking.model.ts";
import mongoose from "mongoose";
import Housing from "../models/Housing.model.ts";

// Create a booking
export const createBooking = asyncHandler(
  async (
    req: Request<{}, {}, CreateBookingBody>,
    res: Response
  ): Promise<void> => {
    // console.log(req.body);
    const { housingId, startDate, endDate, guests } = req.body;

    // Make sure the user is authenticated
    if (!req.user._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Validate required fields
    if (!housingId || !startDate || !endDate || !guests) {
      res.status(400).json({ message: "Missing required booking fields" });
      return;
    }

    // Validate guest fields
    if (
      typeof guests.adults !== "number" ||
      typeof guests.kids !== "number" ||
      typeof guests.animals !== "number"
    ) {
      res.status(400).json({ message: "Invalid guest details" });
      return;
    }

    // Fetch housing with prices
    const housing = await Housing.findById(housingId);
    if (!housing) {
      res.status(404).json({ message: "Housing not found" });
      return;
    }

    // Check guest limits
    if (guests.adults > housing.maxAdults) {
      res.status(400).json({
        message: `Number of adults exceeds the allowed limit (${housing.maxAdults})`,
      });
      return;
    }
    if (guests.kids > housing.maxKids) {
      res.status(400).json({
        message: `Number of kids exceeds the allowed limit (${housing.maxKids})`,
      });
      return;
    }
    if (guests.animals > housing.maxAnimals) {
      res.status(400).json({
        message: `Number of animals exceeds the allowed limit (${housing.maxAnimals})`,
      });
      return;
    }

    const { prices } = housing;

    // Calculate number of nights
    const start = new Date(startDate);
    const end = new Date(endDate);
    const msInDay = 1000 * 60 * 60 * 24; // ms/s, s/min, m/h, h/d (86,400,000 ms/d)

    // date of end, date of start - makes sure no negative day and give difference, math.ceil rounds up
    const nights = Math.ceil((end.getTime() - start.getTime()) / msInDay);
    if (nights <= 0) {
      res.status(400).json({ message: "End date must be after start date" });
      return;
    }

    // Check if the booking dates are within available dates
    let isWithinAvailable = false;
    for (const range of housing.availableDates) {
      if (start >= range.start && end <= range.end) {
        isWithinAvailable = true;
        break;
      }
    }
    if (!isWithinAvailable) {
      res
        .status(400)
        .json({ message: "Booking dates are not within available dates" });
      return;
    }

    // Calculate dynamic total price
    const totalPrice =
      (prices.adult * guests.adults +
        prices.kid * guests.kids +
        prices.animal * guests.animals +
        prices.housing) *
      nights;

    const newBooking = await Booking.create({
      userId: req.user._id,
      housingId: housing._id,
      startDate,
      endDate,
      guests,
      totalPrice,
      perNightPrice: totalPrice / nights,
    });

    const bookedStart = new Date(startDate);
    const bookedEnd = new Date(endDate);
    const newAvailableDates: { start: Date; end: Date }[] = [];
    for (const range of housing.availableDates) {
      const availStart = range.start;
      const availEnd = range.end;
      // If booking fully covers this range, skip it
      if (bookedStart <= availStart && bookedEnd >= availEnd) {
        continue;
      }
      // Add remaining parts of the range (before and/or after booking)
      if (bookedStart > availStart) {
        newAvailableDates.push({
          start: availStart,
          end: new Date(Math.min(bookedStart.getTime(), availEnd.getTime())),
        });
      }
      if (bookedEnd < availEnd) {
        newAvailableDates.push({
          start: new Date(Math.max(bookedEnd.getTime(), availStart.getTime())),
          end: availEnd,
        });
      }
    }
    // If no dates remain, hide the housing
    if (newAvailableDates.length === 0) {
      housing.isAvailable = false;
    } else {
      housing.availableDates = newAvailableDates;
    }
    housing.availableDates = newAvailableDates;
    await housing.save();

    res.status(201).json({
      booking: newBooking,
      nights,
      perNightPrice: totalPrice / nights,
    });
  }
);

// Get all bookings
export const getBookings = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate("userId", "email")
      .populate("housingId", "title location")
      .exec();

    res.status(200).json(bookings);
  }
);

// Get a booking
export const getSpecificBooking = asyncHandler(
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const bookingId = req.params.id;

    if (!mongoose.isValidObjectId(bookingId)) {
      res.status(400).json({ message: "Invalid booking ID" });
      return;
    }

    const booking = await Booking.findById(bookingId)
      .populate("userId", "firstname lastname email")
      .populate("housingId") // "title location"
      .exec();

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    res.status(200).json(booking);
  }
);

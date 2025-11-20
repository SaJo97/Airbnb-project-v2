import Housing from "../models/Housing.model.ts";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import ROLES from "../constants/roles.ts";
import { geocode } from "../utils/geocode.ts";

// controller to create new housing
export const createHousing = asyncHandler(
  async (
    // first generic for P - params, 2nd for resbody, 3rd for reqBody, 4th for reqQuery
    req: Request<{}, {}, CreateHousingBody>,
    res: Response
  ): Promise<void> => {
    // Make sure the user is authenticated
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    // console.log(req.body);
    const {
      title,
      description,
      location,
      availableDates,
      maxAdults,
      maxKids,
      maxAnimals,
      prices,
      type,
      place,
      nearActivities,
      petFriendly,
      images,
      rules,
      bedrooms,
      rooms,
      beds,
    } = req.body;

    if (
      !nearActivities.description ||
      !Array.isArray(nearActivities.activities) ||
      nearActivities.activities.length === 0
    ) {
      res.status(400).json({
        message: "nearActivities and all its fields are required",
      });
      return; // just return void here
    }

    for (const act of nearActivities.activities) {
      if (!act.name.trim() || !act.location.trim()) {
        res.status(400).json({
          message: "Each activity must have a name and a location",
        });
        return;
      }
    }

    // validation
    if (
      !title ||
      !description ||
      !location ||
      !availableDates ||
      !maxAdults ||
      !maxKids ||
      !maxAnimals ||
      !prices ||
      !type ||
      !place ||
      !petFriendly ||
      !images ||
      !rules ||
      !bedrooms ||
      !rooms ||
      !beds
    ) {
      res.status(400).json({ message: "Missing required housing fields" });
      return;
    }

    // Validate `prices` exists and has all 4 keys
    if (
      !prices ||
      typeof prices.adult !== "number" ||
      typeof prices.kid !== "number" ||
      typeof prices.animal !== "number" ||
      typeof prices.housing !== "number"
    ) {
      res.status(400).json({
        message:
          "All price fields (adult, kid, animal, housing) are required and must be numbers",
      });
      return;
    }

    // Validate `availableDates` as an array of range objects
    if (!Array.isArray(availableDates) || availableDates.length === 0) {
      res.status(400).json({
        message: "availableDates must be a non-empty array of date ranges",
      });
      return;
    }
    for (const range of availableDates) {
      if (
        !range.start ||
        !range.end ||
        isNaN(new Date(range.start).getTime()) ||
        isNaN(new Date(range.end).getTime()) ||
        new Date(range.start) >= new Date(range.end)
      ) {
        res.status(400).json({
          message:
            "Each availableDates range must have valid start and end dates, with start < end",
        });
        return;
      }
    }

    //Geocode main housing location
    const mainCoords = await geocode(location);
    if (!mainCoords) {
      res.status(400).json({ message: "Invalid housing location" });
      return;
    }

    //Geocode activities
    const activityResults = [];
    for (const act of nearActivities.activities) {
      const fullLocation = `${act.location}, Sverige`;

      const actCoords = await geocode(fullLocation);

      activityResults.push({
        ...act,
        coords: actCoords || null,
      });

      // Respect rate-limits (1 request/sec)
      await new Promise((r) => setTimeout(r, 1200));
    }

    // Calculate totalPrice
    const totalPrice =
      prices.adult + prices.kid + prices.animal + prices.housing;

    // Generate random rating (3.0 - 5.0)
    const randomRating = Number((Math.random() * 2 + 3).toFixed(1));
    const randomCount = Math.floor(Math.random() * 51) + 50; // 50–100

    console.log(req.user);
    const newHousing = await Housing.create({
      ...req.body, // title, description, etc
      createdBy: req.user._id,
      totalPrice,
      coords: mainCoords,
      nearActivities: {
        description: nearActivities.description,
        activities: activityResults,
      },
      rating: {
        average: randomRating,
        count: randomCount,
      },
    });

    res.status(201).json(newHousing);
  }
);

// controller to get all housings
export const getAllHousings = asyncHandler(
  async (
    req: Request<{}, {}, {}, HousingQuery>,
    res: Response
  ): Promise<void> => {
    const {
      location,
      startDate,
      endDate,
      maxAdults,
      maxKids,
      maxAnimals,
      totalPrice,
      type,
      place,
      petFriendly,
      nearActivities,
    } = req.query;

    // record - defines a object with keys of string & values of any. Init an empty filter object for building MongoDB query conditions dynamically
    const filter: Record<string, any> = {};

    // Filter by location (exact or case-insensitive match)
    if (location) {
      filter.location = { $regex: location as string, $options: "i" };
    }

    // $gte=greater than or equal, $lte=less than or equal (MongoDb query operators)
    // Filter by availableDates overlap (check if any range in the array overlaps with requested startDate-endDate)
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      filter.availableDates = {
        $elemMatch: {
          // elemMatch - MongoDb query operator to check overlap with any range in array
          start: { $lte: end }, // Range starts before or at the requested end
          end: { $gte: start }, // Range ends after or at the requested start
        },
      };
    }

    // Filter by max adults
    if (maxAdults) {
      filter.maxAdults = { $gte: Number(maxAdults) };
    }

    // Filter by max kids
    if (maxKids) {
      filter.maxKids = { $gte: Number(maxKids) };
    }

    // Filter by max animals
    if (maxAnimals) {
      filter.maxAnimals = { $gte: Number(maxAnimals) };
    }

    // Filter by totalPrice (range, e.g., ?totalPrice=100-300)
    if (totalPrice) {
      const parts = (totalPrice as string)
        .split("-")
        .filter((p) => p.trim() !== ""); // ensure only consider non empty parts after trimming whitespaces(split and filter)(100-200 --> ["100", "200"])
      if (parts.length === 2) {
        const min = Number(parts[0]);
        const max = Number(parts[1]);
        if (!isNaN(min) && !isNaN(max)) {
          // convert and check its a number
          filter.totalPrice = { $gte: Number(min), $lte: Number(max) }; // find housing between min and max
        }
      }
    }

    // Filter by type (exact match)
    if (type) {
      filter.type = type;
    }

    // Filter by place (exact match)
    if (place) {
      filter.place = place;
    }

    // Filter by petFriendly
    if (petFriendly !== undefined) {
      filter.petFriendly = petFriendly === "true";
    }

    // Filter by nearActivities (e.g., ?nearActivities=hiking,swimming)
    if (nearActivities) {
      const activities = (nearActivities as string)
        .split(",")
        .map((a) => a.trim());

      filter["nearActivities.activities.name"] = { $all: activities };
    }

    // Only show available housings(hide booked ones)
    filter.isAvailable = true;

    const housings = await Housing.find(filter).exec();

    res.status(200).json(housings);
  }
);

// controller to get a housing
export const getSpecificHousing = asyncHandler(
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const { id } = req.params; // Get the housing ID from request parameters

    // Check if the ID is valid
    if (!mongoose.isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid housing ID");
    }

    const housing = await Housing.findById(id);
    // Check if the housing exist
    if (!housing) {
      res.status(404).json({ message: `Housing not found` });
      // throw new Error("Housing not found");
    }

    res.status(200).json(housing); // Send back the found product with 200 status
  }
);

// controller update housing
export const updateHousing = asyncHandler(
  async (
    req: Request<{ id: string }, {}, Partial<CreateHousingBody>>,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    // Check if the ID is valid
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid housing ID" });
      return;
    }
    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    // Fetch the housing
    const housing = await Housing.findById(id);
    if (!housing) {
      res.status(404).json({ message: "Housing not found" });
      return;
    }
    // Check if the user is the creator
    if (housing.createdBy.toString() !== req.user._id.toString()) {
      res
        .status(403)
        .json({ message: "You can only update your own housings" });
      return;
    }

    // Validate provided fields (similar to createHousing, but only for fields being updated)
    const {
      title,
      description,
      location,
      availableDates,
      maxAdults,
      maxKids,
      maxAnimals,
      prices,
      type,
      place,
      nearActivities,
      petFriendly,
      images,
      rules,
      bedrooms,
      rooms,
      beds,
    } = req.body;

    if (nearActivities !== undefined) {
      if (!nearActivities.description) {
        res
          .status(400)
          .json({ message: "nearActivities.description is required" });
        return;
      }
      if (
        !Array.isArray(nearActivities.activities) ||
        nearActivities.activities.length === 0
      ) {
        res.status(400).json({ message: "At least one activity is required" });
        return;
      }
      for (const act of nearActivities.activities) {
        if (!act.name || !act.location) {
          res
            .status(400)
            .json({ message: "Each activity must have a name and location" });
          return;
        }
      }
    }

    // If updating prices, validate and recalculate totalPrice
    let totalPrice = housing.totalPrice; // Keep existing if not updating
    if (prices) {
      if (
        typeof prices.adult !== "number" ||
        typeof prices.kid !== "number" ||
        typeof prices.animal !== "number" ||
        typeof prices.housing !== "number"
      ) {
        res.status(400).json({
          message:
            "All price fields (adult, kid, animal, housing) must be numbers",
        });
        return;
      }
      totalPrice = prices.adult + prices.kid + prices.animal + prices.housing;
    }

    // If updating availableDates, validate as array of range objects
    if (availableDates !== undefined) {
      if (!Array.isArray(availableDates) || availableDates.length === 0) {
        res.status(400).json({
          message: "availableDates must be a non-empty array of date ranges",
        });
        return;
      }

      for (const range of availableDates) {
        if (
          !range.start ||
          !range.end ||
          isNaN(new Date(range.start).getTime()) ||
          isNaN(new Date(range.end).getTime()) ||
          new Date(range.start) >= new Date(range.end)
        ) {
          res.status(400).json({
            message:
              "Each availableDates range must have valid start and end dates, with start < end",
          });
          return;
        }
      }
    }
    const update: any = { ...req.body };
    //1. If main location updated
    if (location && location !== housing.location) {
      const newCoords = await geocode(location);
      update.coords = newCoords;
    }

    //2. If activities updated
    if (nearActivities?.activities) {
      const updatedActivities = [];
      for (const act of nearActivities.activities) {
        const fullLoc = `${act.location}, Sverige`;
        const actCoords = await geocode(fullLoc);

        updatedActivities.push({
          ...act,
          coords: actCoords || null,
        });

        await new Promise((r) => setTimeout(r, 1200));
      }

      update.nearActivities = {
        description: nearActivities.description,
        activities: updatedActivities,
      };
    }

    // Update the housing with provided fields
    const updatedHousing = await Housing.findByIdAndUpdate(
      id,
      {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(location !== undefined && { location }),
        ...(availableDates !== undefined && { availableDates }),
        ...(maxAdults !== undefined && { maxAdults }),
        ...(maxKids !== undefined && { maxKids }),
        ...(maxAnimals !== undefined && { maxAnimals }),
        ...(prices !== undefined && { prices }),
        ...(totalPrice !== housing.totalPrice && { totalPrice }), // Only update if recalculated
        ...(type !== undefined && { type }),
        ...(place !== undefined && { place }),
        ...(nearActivities !== undefined && { nearActivities }),
        ...(petFriendly !== undefined && { petFriendly }),
        ...(images !== undefined && { images }),
      },
      { new: true } // Return the updated document
    );
    res.status(200).json(updatedHousing);
  }
);

// controller delete housing
export const deleteHousing = asyncHandler(
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const { id } = req.params;
    // Check if the ID is valid
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid housing ID" });
      return;
    }
    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    // Fetch the housing
    const housing = await Housing.findById(id);
    if (!housing) {
      res.status(404).json({ message: "Housing not found" });
      return;
    }
    // Check if the user is the creator or an admin
    const isCreator = housing.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN; // Assuming req.user.role is set by middleware
    if (!isCreator && !isAdmin) {
      res.status(403).json({
        message: "You can only delete your own housings or must be an admin",
      });
      return;
    }
    // Delete the housing
    await Housing.findByIdAndDelete(id);
    res.status(200).json({ message: "Housing deleted successfully" });
  }
);

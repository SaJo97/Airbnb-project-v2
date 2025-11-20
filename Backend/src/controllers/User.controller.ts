import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { generateToken } from "../lib/generateToken.ts";
import ROLES from "../constants/roles.ts";
import bcrypt from "bcrypt";
import User from "../models/User.model.ts";
import mongoose from "mongoose";

// controller to handle user registration
export const register = asyncHandler(
  // first generic for P - params, 2nd for resbody, 3rd for reqBody, 4th for reqQuery
  async (req: Request<{}, {}, RegisterBody>, res: Response): Promise<void> => {
    const { firstname, lastname, email, password } = req.body; // destructure from req body

    // check field are provided
    if (!firstname || !lastname || !email || !password) {
      res.status(400);
      throw new Error("All fields are required");
    }

    const normalizedEmail = email.trim().toLowerCase(); // Normalize email by trimming and converting to lowercase

    // check if user exists
    const userExists = await User.findOne({ email: normalizedEmail }).exec();
    if (userExists) {
      res.status(409); // send 409 if user already exists
      throw new Error("User with this email already exists");
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstname,
      lastname,
      email: normalizedEmail,
      password: hashedPassword,
    });

    // generate a token for the newly created user
    const token = generateToken({
      _id: newUser._id.toString(),
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      email: newUser.email,
      role: newUser.role,
    });

    // send back info with 201 status - created successfully
    res.status(201).json({
      user: {
        _id: newUser._id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  }
);

// controller to handle user login
export const login = asyncHandler(
  async (req: Request<{}, {}, LoginBody>, res: Response): Promise<void> => {
    const { email, password } = req.body; // Destructure email and password from request body

    // Check if email and password are provided
    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    // Find the user by email
    const user = await User.findOne({ email }).exec();
    // Check if the user exists
    if (!user) {
      res.status(401); // 401 less information given, to protect agenst hackers
      throw new Error("Invalid credentials");
    }

    // Compare the provided password with the stored hashed password
    const match = await bcrypt.compare(password, user.password);
    // Check if the password matches
    if (!match) {
      res.status(401);
      throw new Error("Invalid credentials");
    }
    // Generate a token for the authenticated user
    const token = generateToken({
      _id: user._id.toString(),
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
    });
    // Send back the user ID, email, and token with 200 status - OK successful response
    res.status(200).json({
      user: {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
      },
      token,
    });
  }
);

// Admin - get all users
export const getUsers = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const users = await User.find().select("-password").exec(); // info on users expect password
    res.status(200).json(users);
  }
);

//Admin - get specifik user
export const getSpecificUser = asyncHandler(
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const { id } = req.params; // Get the user ID from request parameters

    // Check if the ID is valid
    if (!mongoose.isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid user ID");
    }

    const user = await User.findById(id).exec();
    // Check if the user exist
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).json(user); // Send back the found user with 200 status
  }
);

//Admin - delete a user
export const deleteUser = asyncHandler(
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.params.id;

    // Check if the ID is valid
    if (!mongoose.isValidObjectId(userId)) {
      res.status(400);
      throw new Error("Invalid user ID");
    }

    const user = await User.findByIdAndDelete(userId).exec();
    if (!user) {
      res.status(404); // handle case where user is not found
      throw new Error("User not found");
    }

    res.status(200).json({ message: `User ${user._id} deleted` });
  }
);

//admin - uppdate a user Role
export const updateUserRole = asyncHandler(
  async (
    req: Request<{ id: string }, {}, UpdateRoleBody>,
    res: Response
  ): Promise<void> => {
    const userId = req.params.id;
    const { role } = req.body;

    // Check if the ID is valid
    if (!mongoose.isValidObjectId(userId)) {
      res.status(400);
      throw new Error("Invalid user ID");
    }

    if (!Object.values(ROLES).includes(role)) {
      res.status(400); // return bad request 400 if role invalid
      throw new Error("Invalid role");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).exec(); // find and update
    if (!user) {
      res.status(404).json({ message: "User not found" }); // handle case where user is not found
    }

    res.status(200).json({ message: `User role updated to ${role}` });
  }
);

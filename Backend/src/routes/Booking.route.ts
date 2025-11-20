import express from "express";
import {
  createBooking,
  getBookings,
  getSpecificBooking,
} from "../controllers/Booking.controller.ts";
import { verifyToken } from "../middleware/auth.middleware.ts";

const router = express.Router();
//verify roles and auth
router.post("/", verifyToken, createBooking); // skapa bokning

router.get("/", verifyToken, getBookings); // hämta bokningar (historik)
router.get("/:id", verifyToken, getSpecificBooking); // hämta spec bokning

export default router;

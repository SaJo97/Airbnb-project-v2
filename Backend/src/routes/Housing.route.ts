import express from "express";
import {
  createHousing,
  deleteHousing,
  getAllHousings,
  getSpecificHousing,
  updateHousing,
} from "../controllers/Housing.controller.ts";
import { verifyRoles, verifyToken } from "../middleware/auth.middleware.ts";
import ROLES from "../constants/roles.ts";

const router = express.Router();
// verify roles & auth
router.post("/", verifyToken, createHousing); // skapa annons för airbnb (member, admin)

router.get("/", getAllHousings); // hämta alla airbnb
// GET /api/housings?location=stockholm&petFriendly=true&type=cabin
// GET /api/housings?startDate=2025-12-01&endDate=2025-12-10&maxAdults=2
// GET /api/housings?totalPrice=100-300&nearActivities=hiking,swimming

router.get("/:id", getSpecificHousing); // hämta spec

router.put("/:id", verifyToken, updateHousing); //uppdatering (av skaparen)
router.patch("/:id", verifyToken, updateHousing); // uppdatering (av skaparen)

router.delete(
  "/:id",
  verifyToken,
  verifyRoles(ROLES.ADMIN, ROLES.MEMBER),
  deleteHousing
); //ta bort annons (admin, member)

export default router;


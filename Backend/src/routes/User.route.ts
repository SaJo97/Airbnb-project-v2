import express from "express";
import {
  deleteUser,
  getSpecificUser,
  getUsers,
  login,
  register,
  updateUserRole,
} from "../controllers/User.controller.ts";
import { verifyRoles, verifyToken } from "../middleware/auth.middleware.ts";
import ROLES from "../constants/roles.ts";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);

//admin panel
router.get("/users", verifyToken, verifyRoles(ROLES.ADMIN), getUsers); // hämta alla användare i en admin panel
router.get(
  "/users/:id",
  verifyToken,
  verifyRoles(ROLES.ADMIN),
  getSpecificUser
); // hämta specific användare i admin panel
router.delete("/users/:id", verifyToken, verifyRoles(ROLES.ADMIN), deleteUser); // ta bort användare - admin panel
router.put(
  "/users/:id/role",
  verifyToken,
  verifyRoles(ROLES.ADMIN),
  updateUserRole
); // ändra roller på användare - admin panel

export default router;

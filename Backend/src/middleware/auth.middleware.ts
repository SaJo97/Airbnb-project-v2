import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";


// Extend Express Request to include user info - module augmentation - allow extend or modify the type def of existing module - custom property user
declare module "express-serve-static-core" {
  interface Request {
    user: DecodedUserInfo["userInfo"];// lookup type - extracts from userInfo - able to use req.user
  }
}
// Middleware function to verify the JSON Web Token (JWT)
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get the authorization header from the request
    const authHeader = req.headers.authorization || req.headers.Authorization;
    // Check if the authorization header is present and starts with "Bearer "
    if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ message: "Not authenticated. No token provided!" });
      return;
    }
    // Extract the token from the authorization header
    const token = authHeader.split(" ")[1];

    // ensure token is a non-empty strng
    if(!token || typeof token !== "string"){
      res.status(401).json({message: "Invalid token format"});
      return;
    }

    const secret = process.env.ACCESS_TOKEN_SECRET as string;

    if (!secret) {
      throw new Error("ACCESS_TOKEN_SECRET is not defined");
    }

    // Verify the token using the secret key from environment variables
    const decoded = jwt.verify(token, secret);

    // Type guard: Ensure decoded is an object with expected shape
    // Attach the decoded user information to the request object
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userInfo" in decoded 
      //  && typeof (decoded as any).userInfo === "object"
    ) {
      const payload = decoded as JwtPayload & {userInfo: DecodedUserInfo["userInfo"]}
      req.user = payload.userInfo;
      // req.user = (decoded as DecodedUserInfo).userInfo;
      next();
    } else {
      res.status(401).json({ message: "Invalid token payload structure" });
    }
  } catch (err) {
    console.error("JWT verification failed:", err);
    res.status(401).json({ message: "Not authenticated" });
  }
};

// Middleware: Role-based access control
export const verifyRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      res.status(403).json({ message: "Access denied: No roles assigned" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: `Access denied: Requires role (${allowedRoles.join(", ")})`,
      });
      return;
    }

    next();
  };
};

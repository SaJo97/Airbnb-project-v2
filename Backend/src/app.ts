import express from "express";
import "dotenv/config"; // makes it so npm run dev/start load env file
import housingRouter from "./routes/Housing.route.ts";
import bookingRouter from "./routes/Booking.route.ts";
import authRouter from "./routes/User.route.ts";
import { errorHandler, notFound } from "./middleware/error.middleware.ts";
import cors from "cors";

const app = express(); // Create an instance of an Express application

// Middleware to parse incoming JSON requests
app.use(express.json());

// Middleware to enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Proxy for Nominatim to avoid CORS issues
app.use("/api/nominatim", async (req, res) => {
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org${req.url}`;
    const response = await fetch(nominatimUrl, {
      mode: 'cors',
      headers: {
        "User-Agent":
          req.headers["user-agent"] || "MyHousingApp/1.0 (contact@example.com)", // Forward client's User-Agent
        "Accept-Language": req.headers["accept-language"] || "sv en;q=0.8",
        Referer: req.headers["referer"] || "http://localhost:5173", // Add referrer
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).send(errorText);
      return;
    }
    const data = await response.text();
    res.set("Content-Type", "application/json");
    res.send(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).send("Error proxying Nominatim");
  }
});

// Define routes for different API endpoints
app.use("/api/housings", housingRouter); // Route for housing-related operations
app.use("/api/bookings", bookingRouter); // Router for booking-related operations
app.use("/api/auth", authRouter); // Route for authentication-related operations

// Middleware to handle 404 Not Found errors
app.use(notFound);

// Middleware to handle errors
app.use(errorHandler);

export default app;

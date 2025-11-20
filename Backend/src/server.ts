import app from './app.ts' // compiles app.ts -> app.js (ESM import)
import mongoose from "mongoose";
import 'dotenv/config';

// Define the port for the server to listen on, using the environment variable or defaulting to 8000
const PORT = Number(process.env.PORT) || 8000;

// Get the MongoDB connection URI from environment variables
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('MONGO_URI is not defined in environment variables.');
}

// Function to connect to the MongoDB database
const dbConnect = async () => {
  try {
    // Attempt to connect to MongoDB using the connection URI
    const mongo = await mongoose.connect(MONGO_URI);
    // Log a message indicating successful connection and the host
    console.log(`MongoDB Connected: ${mongo.connection.host}`);
  } catch (err: any) {
    // Log an error message if the connection fails
    console.log(`MongoDB Connection Error: ${err.message}`);
    // Exit the process with a failure code
    process.exit(1);
  }
};

const startServer = async () => {
  try {
    // Connect to the database
    await dbConnect();
    // Start the Express server and listen on the specified port
    app.listen(PORT, () =>
      console.log(`Server is running on http://localhost:${PORT}`)
    );
  } catch (err: any) {
    // Log an error message if the server fails to start
    console.log('Failed to start server: ', err.message)
    // Exit the process with a failure code
    process.exit(1)
  }
}

startServer();
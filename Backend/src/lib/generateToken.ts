import jwt from "jsonwebtoken";

// Function to generate a JSON Web Token (JWT) for a user
export const generateToken = (user: UserPayload): string => {
  return jwt.sign(
    {
      userInfo: {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
      },
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: "15h" }
  );
};

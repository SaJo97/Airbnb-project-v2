type RegisterBody = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

type LoginBody = {
  email: string;
  password: string;
}

type UpdateRoleBody = {
  role: (typeof ROLES)[keyof typeof ROLES];
}

// Define a type for the user object
type UserPayload = {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

// type for the expected structure of the token's payload
type DecodedUserInfo = {
  userInfo: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    role: string;
  };
}
import bcrypt from "bcryptjs";
import { User } from "@/models/User.js";
import { generateToken } from "@/lib/jwt.js";

export const signupUser = async (userData) => {
  const { firstName, lastName, email, password, phone, role } = userData;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    phone,
    ...(role && { role }),
  });

  return user;
};

export const loginUser = async (email, password) => {
  const checkUser = await User.findOne({ email });

  if (!checkUser) {
    throw new Error("Invalid credentials");
  }

  const isValid = await bcrypt.compare(password, checkUser.password);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(checkUser);
  return {token,
    role:checkUser.role};
};
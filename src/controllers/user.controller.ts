// src/controllers/AdminController.ts
import { RequestHandler } from 'express';
import Admin, { IAdmin } from '../models/user';
import jwt from 'jsonwebtoken';

// Signup Controller
export const signup: RequestHandler = async (req, res) => {
  const { username, password, email, role } = req.body;

  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      res.status(400).json({ message: 'Admin already exists' });
      return;
    }

    // Create a new admin
    const newAdmin = new Admin({ username, password, email, role });
    await newAdmin.save();

    // Respond with success message
    res.status(201).json({ message: 'Admin created successfully', admin: newAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin', error });
  }
};

// Login Controller
export const login: RequestHandler = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the admin by username
    const admin = await Admin.findOne({ username }).exec();
    if (!admin) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Compare the password
    // const isMatch = await new Promise((resolve, reject) => {
    //   admin.comparePassword(password, (err: any, isMatch: boolean) => {
    //     if (err) return reject(err);
    //     resolve(isMatch);
    //   });
    // });

    admin.comparePassword(password, (err:any, isMatch: boolean) => {
      if (err || !isMatch) {
        res.status(400).json({ message: `Invalid credentials`});
        return;
      }

      // Generate JWT token
      const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET as string, {
        expiresIn: '1h', // Token expiration time
      });

      // Respond with the token and admin info
      res.status(200).json({ token, admin: { id: admin._id, username: admin.username, email: admin.email, role: admin.role } });

      })

    // if (!isMatch) {
    //   return res.status(400).json({ message: 'Invalid credentials' });
    // }

      } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

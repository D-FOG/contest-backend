import express, { Request, Response } from 'express';
import Contest from '../models/contest';
import redisClient from '../config/redis';
import { Server } from 'socket.io';
import multer from 'multer';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { getSocketIO } from '../sockets/socket';
// Set up the Redis and Socket.IO instances (assuming io is passed from app.js)
let io: Server;

export const setSocketIo = (socketIoInstance: Server) => {
  io = socketIoInstance;
};

//seting up aws
const s3 = new AWS.S3({
  accessKeyId:process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

//multer setup for uploads
const upload = multer({
  storage: multer.memoryStorage(),
});

// Custom interface for Multer files
interface MulterFile {
    buffer: Buffer;
    encoding: string;
    fieldname: string;
    mimetype: string;
    originalname: string;
    size: number;
  }
  
  interface CustomRequest extends Request {
    files: {
      image?: Express.Multer.File[]; // Array of image files
      video?: Express.Multer.File[]; // Array of video files
    };
  }
  

// Helper function to upload files to S3
const uploadFileToS3 = (file: Express.Multer.File, folder: string) => {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: `${folder}/${uuidv4()}-${file.originalname}`, // Unique file name
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // Set access control to public
    };
  
    return s3.upload(params).promise();
  };

// Create Contest Controller
export const createContest = async (req: CustomRequest, res: Response): Promise<void> => {
  const {
    productName,
    tags,
    referenceUrl,
    goal,
    category,
    campaign,
    startTime,
    feedImageUrl,
    currency,
    productCode,
    premium,
    payToken,
    amount,
  } = req.body;

  // Required fields validation
    if (!productName || !category || !campaign) {
        res.status(400).json({ message: 'Product name, category, and campaign are required' });
        return;
    }

  try {
    // Get the Socket.IO instance
    const io = getSocketIO();

    const imageFile = req.files?.image ? req.files.image[0] : null; // Get first image file
    const videoFile = req.files?.video ? req.files.video[0] : null; // Get first video file

    // Upload files to S3 and get URLs
    const imageUrl = imageFile ? (await uploadFileToS3(imageFile, 'images')).Location : null;
    const videoUrl = videoFile ? (await uploadFileToS3(videoFile, 'videos')).Location : null;


    // Create a new contest in MongoDB
    const newContest = new Contest({
      productName,
      tags,
      videoUrl,
      referenceUrl,
      goal,
      category,
      campaign,
      startTime,
      imageUrl,
      feedImageUrl,
      currency,
      productCode,
      premium,
      payToken,
      amount,
    });

    await newContest.save();

    // Cache the new contest in Redis
    const contestKey = `contest:${newContest._id}`;
    await redisClient.set(contestKey, JSON.stringify(newContest));

    // Emit the new contest to clients via Socket.IO
    io.emit('contest-created', newContest);

    res.status(201).json({ message: 'Contest created successfully', contest: newContest });
  } catch (error) {
    console.error('Error creating contest:', error);
    res.status(500).json({ message: 'Error creating contest', error });
  }
};

// Edit Contest Controller
export const editContest = async (req: CustomRequest, res: Response): Promise<void> => {
  const { contestId } = req.params;
  const {
    productName,
    tags,
    referenceUrl,
    goal,
    category,
    campaign,
    startTime,
    feedImageUrl,
    currency,
    productCode,
    premium,
    payToken,
    amount,
  } = req.body;

  // Required fields validation
  if (!productName || !category || !campaign) {
    res.status(400).json({ message: 'Product name, category, and campaign are required' });
    return;
}

  try {

    // Get the Socket.IO instance
    const io = getSocketIO();

    //const contestId = req.params.id; // Get contest ID from request parameters
    let existingContest;
    //const id = contestId;

    // If contestId is provided, fetch the existing contest
    if (contestId) {
      existingContest = await Contest.findById(contestId);
      if (!existingContest) {
            res.status(404).json({ message: 'Contest not found' });
            return;
        }
    }
    const imageFile = req.files?.image ? req.files.image[0] : null; // Get first image file
    const videoFile = req.files?.video ? req.files.video[0] : null; // Get first video file

    // Function to delete file from S3
    const deleteFileFromS3 = async (fileUrl: string) => {
        const key = fileUrl.split('/').pop(); // Extract the filename from the URL
        const params = {
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: key,
        };
        return s3.deleteObject(params).promise();
      };
  
      // Delete old files from S3 if they exist
      if (existingContest) {
        if (existingContest.imageUrl) {
          await deleteFileFromS3(existingContest.imageUrl);
        }
        if (existingContest.videoUrl) {
          await deleteFileFromS3(existingContest.videoUrl);
        }
      }
  
      // Upload files to S3 and get URLs
    const imageUrl = imageFile ? (await uploadFileToS3(imageFile, 'images')).Location : null;
    const videoUrl = videoFile ? (await uploadFileToS3(videoFile, 'videos')).Location : null;

    // Update the contest in MongoDB
    const updatedContest = await Contest.findByIdAndUpdate(
      contestId,
      {
        productName,
        tags,
        videoUrl,
        referenceUrl,
        goal,
        category,
        campaign,
        startTime,
        imageUrl,
        feedImageUrl,
        currency,
        productCode,
        premium,
        payToken,
        amount,
      },
      { new: true, runValidators: true }
    );

    if (!updatedContest) {
      res.status(404).json({ message: 'Contest not found' });
      return;
    }

    // Save contest update in Redis
    const contestKey = `contest:${contestId}`;
    await redisClient.set(contestKey, global.JSON.stringify(updatedContest));

    // Emit update to clients via Socket.IO
    io.emit('contest-updated', updatedContest);

    res.status(200).json({ message: 'Contest updated successfully', contest: updatedContest });
  } catch (error) {
    console.error('Error updating contest:', error);
    res.status(500).json({ message: 'Error updating contest', error });
  }
};

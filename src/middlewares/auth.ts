// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload; // Adjust based on your JWT structure
    }
  }
}

const protect = (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader: string | undefined = req.headers.authorization;

    if (!authHeader){
        res.status(401).json({ message: `There is no aut token`});
        return;
    }

    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        const parts = authHeader?.split(' ') as [string, string];

        // Check that we have exactly 2 parts
        if (parts.length === 2) {
          const token = parts[1]; // Get the token from the array

          try {
              // Verify token
              const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
              // Add user information to the request object
              req.user = decoded; // or whatever you want to attach
              next();
          } catch (error) {
              res.status(401).json({ message: 'Not authorized, token failed' });
          }
        } else {
            res.status(401).json({ message: 'Not authorized, no token' });
        }
      }
};

export default protect;

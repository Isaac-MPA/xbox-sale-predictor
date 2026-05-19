import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * Auth Controller - Handles authentication
 */
export class AuthController {
  /**
   * User registration
   */
  static async register(req: Request, res: Response): Promise<void> {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(400, 'User already exists');
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || '',
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: 'USER',
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user,
        token,
      },
    });
  }

  /**
   * User login
   */
  static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Check password
    const passwordMatch = await bcryptjs.compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    });
  }

  /**
   * Get current user
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  }
}

export default AuthController;

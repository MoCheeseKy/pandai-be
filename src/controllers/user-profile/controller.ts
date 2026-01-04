import { Request, Response } from 'express';
import routes from '../../routes/v1';
import userProfileService from './service';
import asyncHandler from '../../modules/AsyncHandler';
import authorization from '../../common/middleware/Authorization';
import {
  studentProfileSchema,
  teacherProfileSchema,
  wakaProfileSchema,
  parentProfileSchema,
} from './schema';

// Endpoint: PUT /profile/student
routes.put(
  '/profile/student',
  authorization,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userLogin.id;
    const formData = studentProfileSchema.validateSync(req.body);
    const serviceResponse = await userProfileService.updateProfile(
      userId,
      'murid',
      formData
    );
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);

// Endpoint: PUT /profile/teacher
routes.put(
  '/profile/teacher',
  authorization,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userLogin.id;
    const formData = teacherProfileSchema.validateSync(req.body);
    const serviceResponse = await userProfileService.updateProfile(
      userId,
      'guru',
      formData
    );
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);

// Endpoint: GET /profile/me
routes.get(
  '/profile/me',
  authorization,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userLogin.id;
    const serviceResponse = await userProfileService.getMyProfile(userId);
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);

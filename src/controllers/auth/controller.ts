import { Request, Response } from "express";
import routes from "../../routes/v1";
import authService from "./service";
import asyncHandler from "../../modules/AsyncHandler";

routes.post(
  "/auth/signin",
  asyncHandler(async (req: Request, res: Response) => {
    const formData = req.body;

    const serviceResponse = await authService.signIn(formData);

    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);

routes.post(
  "/auth/signup",
  asyncHandler(async (req: Request, res: Response) => {
    const formData = req.body;

    const serviceResponse = await authService.signUp(formData);

    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);

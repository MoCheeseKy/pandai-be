import { Request, Response } from "express";
import asyncHandler from "../../modules/AsyncHandler";
import authService from "./service";

export const signIn = asyncHandler(async (req: Request, res: Response) => {
  const serviceResponse = await authService.signIn(req.body);
  res.status(serviceResponse.statusCode).json(serviceResponse);
});

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const serviceResponse = await authService.signUp(req.body);
  res.status(serviceResponse.statusCode).json(serviceResponse);
});

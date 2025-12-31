import db from "../../config/firebase.config";
import { LoginType, RegisterType, loginSchema, registerSchema } from "./schema";
import { ServiceResponse } from "../../common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { v4 } from "uuid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../common/utils/envConfig";
import { UserType } from "../../controllers/user/schema";

class authService {
  async signIn(formData: LoginType) {
    const validated = loginSchema.validateSync(formData);
    const userRef = db.collection("users");
    const findUser = await userRef.where("email", "==", formData.email).get();

    if (findUser.empty) {
      return ServiceResponse.failure(
        "User not found",
        null,
        StatusCodes.NOT_FOUND
      );
    }

    const userData = findUser.docs[0].data() as UserType;
    const validatePassword = bcrypt.compareSync(
      formData.password,
      userData.password
    );

    if (!validatePassword) {
      return ServiceResponse.failure(
        "Email and Password incorrect",
        null,
        StatusCodes.UNAUTHORIZED
      );
    }

    // Ambil data tanpa password untuk token
    const { password, ...payload } = userData;

    const token = jwt.sign(payload, env.JWT_SECRET_ACCESS_TOKEN as string, {
      expiresIn: "24h",
    });
    return ServiceResponse.success("success", token, StatusCodes.OK);
  }

  async signUp(formData: RegisterType) {
    const validateForm = registerSchema.validateSync(formData);
    const userRef = db.collection("users");

    const duplicateEmail = await userRef
      .where("email", "==", formData.email)
      .get();
    if (!duplicateEmail.empty) {
      return ServiceResponse.failure(
        "Email already used",
        null,
        StatusCodes.CONFLICT
      );
    }

    const userId = v4();
    const newUser = {
      id: userId,
      fullname: formData.fullname,
      email: formData.email,
      password: bcrypt.hashSync(formData.password, bcrypt.genSaltSync(7)),
      role: formData.role, // Perbaikan 1
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await userRef.doc(userId).set(newUser);

    // Buat payload tanpa password
    const { password, ...payload } = newUser; // Perbaikan 2 & 3

    const token = jwt.sign(payload, env.JWT_SECRET_ACCESS_TOKEN as string, {
      expiresIn: "24h",
    });
    return ServiceResponse.success("success", token, StatusCodes.CREATED);
  }
}
export default new authService();

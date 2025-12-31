import * as yup from "yup";

/* ======================================================
   AUTH SCHEMA (INPUT DARI CLIENT)
====================================================== */

/* ---------- SIGN UP ---------- */
export const registerSchema = yup.object({
  fullname: yup.string().trim().required("Fullname is required"),

  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),

  password: yup
    .string()
    .min(8, "Password minimum 8 characters")
    .required("Password is required"),

  role: yup
    .string()
    .oneOf(["murid", "guru", "waka", "orang_tua"], "Role tidak valid")
    .required("Role is required"),
});

export type RegisterType = yup.InferType<typeof registerSchema>;

/* ---------- SIGN IN ---------- */
export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),

  password: yup.string().required("Password is required"),
});

export type LoginType = yup.InferType<typeof loginSchema>;

/* ======================================================
   USER MODEL (DATA DI FIRESTORE)
====================================================== */

export type UserRole = "murid" | "guru" | "waka" | "orang_tua";

export type UserType = {
  id: string;
  fullname: string;
  email: string;
  password: string; // WAJIB ADA (hash)
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

/* ======================================================
   JWT PAYLOAD (TOKEN)
====================================================== */

export type JwtPayloadType = {
  id: string;
  email: string;
  role: UserRole;
};

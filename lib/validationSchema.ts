import * as Yup from "yup";

 // Validation schema for step 1 (email)
 export const email = Yup.object().shape({
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),
  });

  // Validation schema for step 2 (password)
 export const password = Yup.object().shape({
    password: Yup.string()
      .min(8, "Password must be at least 8 characters long")
      .required("Password is required"),
  });

  export const passwordSchema = Yup.object().shape({
    password: Yup.string()
      .min(8, "Password must be at least 8 characters long")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm Password is required"),
  });

  export const changePasswordSchema = Yup.object().shape({
    currentPassword: Yup.string()
    .min(8, "Password must be at least 8 characters long")
      .required("Current password is required"),
    newPassword: Yup.string()
      .min(8, "Password must be at least 8 characters long")
      .required("New password is required"),
    confirmNewPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], "Passwords must match")
      .required("Confirm new password is required"),
  });
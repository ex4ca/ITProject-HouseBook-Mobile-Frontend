export const MINPASSWORDLEN = 6;
export const MAXEMAILLEN = 254;
export const MAXNAMELEN = 50;
export const MAXPASSWORDLEN = 128;

/**
 * Validates a password string against a set of criteria.
 */
export const validatePassword = (pwd: string) => {
  return {
    hasMinLength: pwd.length >= MINPASSWORDLEN,
    hasUppercase: /[A-Z]/.test(pwd),
    hasLowercase: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  };
};

/**
 * Gets a list of unmet password requirements.
 */
export const getPasswordValidationMessages = (pwd: string) => {
  const validation = validatePassword(pwd);
  const messages = [];

  if (!validation.hasMinLength) {
    messages.push(`At least ${MINPASSWORDLEN} characters`);
  }
  if (!validation.hasUppercase) {
    messages.push("1 capital letter");
  }
  if (!validation.hasLowercase) {
    messages.push("1 lowercase letter");
  }
  if (!validation.hasNumber) {
    messages.push("1 number");
  }
  if (!validation.hasSpecialChar) {
    messages.push("1 special character");
  }

  return messages;
};

/**
 * Validates user signup inputs and returns an error message if invalid.
 * Returns null if all validations pass.
 */
export const validateSignUpForm = (
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  password: string,
  confirmPassword: string,
  agreeToTerms: boolean
): { title: string; message: string } | null => {
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !confirmPassword ||
    !phone
  ) {
    return { title: "Missing Information", message: "Please fill in all fields." };
  }
  if (password !== confirmPassword) {
    return { title: "Password Mismatch", message: "Passwords do not match." };
  }
  if (!agreeToTerms) {
    return {
      title: "Terms and Conditions",
      message: "You must agree to the terms to continue.",
    };
  }
  if (!firstName.trim().match(/^[\p{L}]+(?:[\s'-][\p{L}]+)*$/u)) {
    return {
      title: "Invalid First Name",
      message: "First name can only contain letters, spaces, hyphens, and apostrophes.",
    };
  }
  if (!lastName.trim().match(/^[\p{L}]+(?:[\s'-][\p{L}]+)*$/u)) {
    return {
      title: "Invalid Last Name",
      message: "Last name can only contain letters, spaces, hyphens, and apostrophes.",
    };
  }
  if (!email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
    return { title: "Invalid Email", message: "Please enter a valid email address." };
  }
  if (!phone.match(/^[0-9]{2,4}[- ]?[0-9]{3,4}[- ]?[0-9]{3,4}$/)) {
    return { title: "Invalid Phone Number", message: "Please enter a valid phone number." };
  }
  if (password.length < MINPASSWORDLEN) {
    return {
      title: "Weak Password",
      message: `Password must be at least ${MINPASSWORDLEN} characters long.`,
    };
  }
  if (!password.match(/[A-Z]/)) {
    return {
      title: "Weak Password",
      message: "Password must contain at least one uppercase letter.",
    };
  }
  if (!password.match(/[a-z]/)) {
    return {
      title: "Weak Password",
      message: "Password must contain at least one lowercase letter.",
    };
  }
  if (!password.match(/[0-9]/)) {
    return {
      title: "Weak Password",
      message: "Password must contain at least one number.",
    };
  }
  if (!password.match(/[!@#$%^&*(),.?":{}|<>]/)) {
    return {
      title: "Weak Password",
      message: "Password must contain at least one special character.",
    };
  }
  if (email.length > MAXEMAILLEN) {
    return {
      title: "Input Too Long",
      message: `Email cannot exceed ${MAXEMAILLEN} characters.`,
    };
  }
  if (firstName.length > MAXNAMELEN) {
    return {
      title: "Input Too Long",
      message: `First name cannot exceed ${MAXNAMELEN} characters.`,
    };
  }
  if (lastName.length > MAXNAMELEN) {
    return {
      title: "Input Too Long",
      message: `Last name cannot exceed ${MAXNAMELEN} characters.`,
    };
  }
  if (password.length > MAXPASSWORDLEN) {
    return {
      title: "Input Too Long",
      message: `Password cannot exceed ${MAXPASSWORDLEN} characters.`,
    };
  }

  return null;
};

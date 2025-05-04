import bcrypt from 'bcrypt';

// Function to salt and hash a password
export const saltAndHashPassword = async (password) => {
  // Generate a salt
  const saltRounds = 10; // You can adjust the number of salt rounds for security
  const salt = await bcrypt.genSalt(saltRounds);
  
  // Hash the password with the salt
  const hashedPassword = await bcrypt.hash(password, salt);
  
  return hashedPassword;
};

// Function to compare a plaintext password with a hashed password
export const comparePassword = async (plaintextPassword, hashedPassword) => {
  return await bcrypt.compare(plaintextPassword, hashedPassword);
};

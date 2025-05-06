import { saltAndHashPassword } from "@/app/utils/snhpass";
import { comparePassword } from "@/app/utils/snhpass";
import users from "@/app/mock/users.json";

// Function to simulate database user retrieval
const getUserFromDb = async (email: string, passwordHash: string) => {
  if (!email || !passwordHash) {
    throw new Error("Email and password hash are required");
  }

  // Find user by email
  const user = users.find(u => u.email === email);
  
  if (user) {
    // Compare the provided password hash with the stored password
    // Note: In a real application, you would compare hashes, not plaintext
    const isMatch = await comparePassword(user.password, passwordHash);
    
    if (isMatch) {
      return {
        id: user.id,
        email: user.email,
        name: user.username, // Using username as name
        role: user.role
      };
    }
  }
  
  return null;
};

// Export the function for use in your NextAuth configuration
export { getUserFromDb };
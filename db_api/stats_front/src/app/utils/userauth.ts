import { saltAndHashPassword } from "@/app/utils/snhpass";

// Mock user data for testing
const mockUser = {
    email: "test@test.test",
    password: "testtest", // This is the plaintext password for testing
    name: "Test User", // You can add more user properties as needed
  };
  
  // Function to simulate database user retrieval
  const getUserFromDb = async (email, passwordHash) => {
    // Check if the provided email matches the hardcoded email
    if (email === mockUser.email) {
      // Here we compare the hashed password with the plaintext password
      // In a real application, you would hash the input password and compare it with the stored hash
      if (passwordHash === saltAndHashPassword(mockUser.password)) {
        return {
          email: mockUser.email,
          name: mockUser.name,
          // Add any other user properties you want to return
        };
      }
    }
    // Return null if no user is found or credentials do not match
    return null;
  };
  
  // Export the function for use in your NextAuth configuration
  export { getUserFromDb };
  
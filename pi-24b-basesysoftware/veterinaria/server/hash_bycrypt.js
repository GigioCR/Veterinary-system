const bcrypt = require('bcryptjs');

// Function to hash a password
async function hashPassword(password) {
  const saltRounds = 10; // Same as in your application
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(`Original Password: ${password}`);
    console.log(`Hashed Password: ${hashedPassword}`);
  } catch (err) {
    console.error('Error hashing password:', err);
  }
}

// Example usage:
hashPassword('C0ntr4$EN4'); // Replace with the password you want to hash

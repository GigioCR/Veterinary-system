const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const oracledb = require('oracledb');
const config = require('../config/dbConfig');
const crypto = require('crypto');
const { sendForgotPasswordEmail } = require('./../services/emailService');
require('dotenv').config();

// Register client
const registerUser = asyncHandler(async (req, res) => {
  const { userId, nombre, apellido, correo, contrasena, direccion } = req.body;
  console.log(`Called to registerUser function`);
  let conn;

  try {
      // Input validation
      if (!userId || !nombre || !apellido || !correo || !contrasena) {
          return res.status(400).json({ message: 'Todos los campos son obligatorios' });
      }

      conn = await oracledb.getConnection(config);

      // Hash the password
      const hashedPassword = await bcrypt.hash(contrasena, 10);
      console.log(`Executing stored procedure...`);

      // Call stored procedure
      const result = await conn.execute(
          `BEGIN
              ADMIN.AuthInsertClient(:p_idUsuario, :p_nombre, :p_apellido, :p_correo, :p_contrasena, :p_dir, :p_emailExists, :p_error);
          END;`,
          {
              p_idUsuario: { dir: oracledb.BIND_IN, val: userId },
              p_nombre: { dir: oracledb.BIND_IN, val: nombre },
              p_apellido: { dir: oracledb.BIND_IN, val: apellido },
              p_correo: { dir: oracledb.BIND_IN, val: correo },
              p_contrasena: { dir: oracledb.BIND_IN, val: hashedPassword },
              p_dir: { dir: oracledb.BIND_IN, val: direccion },
              p_emailExists: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
              p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          }
      );

      // Handle email existence check
      if (result.outBinds.p_emailExists > 0) {
          return res.status(400).json({ message: 'Correo o ID de usuario ya están registrados' });
      }

      // Handle other errors
      if (result.outBinds.p_error != null) {
          throw new Error(result.outBinds.p_error);
      }

      res.status(201).json({ message: 'Nuevo cliente registrado exitosamente' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Hubo un error al registrar el cliente' });
  } finally {
      if (conn) await conn.close();
  }
});

// User Login
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  let conn;

  try {
    // Establish a database connection
    conn = await oracledb.getConnection(config);

    // Execute the stored procedure to check if the user exists
    const resultUserExists = await conn.execute(
      `BEGIN
          ADMIN.AuthCheckUserExists(:p_username, :p_userExists, :p_hashedPassword, :p_error);
      END;`,
      {
          p_username: { dir: oracledb.BIND_IN, val: username },
          p_userExists: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          p_hashedPassword: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
      }
    );

    if (resultUserExists.outBinds.p_error != null) {
      throw new Error(resultUserExists.outBinds.p_error);
    }

    if (resultUserExists.outBinds.p_userExists === 0) {
      return res.status(404).send({ message: 'El usuario no se pudo encontrar' });
    }

    const hashedPassword = resultUserExists.outBinds.p_hashedPassword;    
    
    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(password, hashedPassword);

    if (!passwordMatch) {
      return res.status(400).send({ message: 'Las contraseñas no son las mismas' });
    }

    ///TODO [VAL] - Magic Strings, pass to constants 
    // Check which type of user they are by searching in the specific tables
    const resultUserType = await conn.execute(
      `BEGIN
          ADMIN.AuthCheckUserType(:p_username, :p_userType, :p_redirectRoute, :p_userId, :p_nombre, :p_apellido, :p_error);
      END;`,
      {
          p_username: { dir: oracledb.BIND_IN, val: username },
          p_userType: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 20 },
          p_redirectRoute: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 },
          p_userId: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 },
          p_nombre: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 },
          p_apellido: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 },
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
      }
    );
    
    if (resultUserType.outBinds.p_error != null) {
        throw new Error(resultUserType.outBinds.p_error);
    }
    
    const userType = resultUserType.outBinds.p_userType;
    const redirectRoute = resultUserType.outBinds.p_redirectRoute;
    const userId = resultUserType.outBinds.p_userId;
    const fullName = `${resultUserType.outBinds.p_nombre} ${resultUserType.outBinds.p_apellido}`;  

    if (!userType) {
      return res.status(400).send({ message: 'El tipo de usuario no existe o no se pudo reconocer' });
    }

    // Create access token (short-lived)
    const accessToken = jwt.sign(
      {
        userId,
        name: fullName,
        userType,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Short expiration for access token
    );

    // Create refresh token (longer-lived)
    const refreshToken = jwt.sign(
      {
        userId,
        userType,
      },
      process.env.JWT_SECRET,
      { expiresIn: '6h' } // Longer expiration for refresh token
    );
    
    // Send back token and redirect route
    res.status(200).send({
      message: 'El login fué exitoso',
      access_token: accessToken,
      refresh_token: refreshToken,
      redirectRoute,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Hubo un error al ingresar', error });
  } finally {
    if (conn) await conn.close();
  }
});

// Refresh Access Token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, userType: decoded.userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // New access token expiration
    );

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Invalid refresh token:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Request Password Reset
const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  let conn;

  try {
    // Step 1: Connect to the database
    conn = await oracledb.getConnection(config);

    // Step 2: Verify if the email exists in the EL_BIGOTE.USUARIOS table
    const result = await conn.execute(
      `SELECT NOMBRE FROM EL_BIGOTE.USUARIOS WHERE CORREO = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Step 3: Generate a secure token and expiration time
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Step 4: Store the token and expiration in EL_BIGOTE.password_resets table
    // TODO[val] - procedimiento almacenado
    await conn.execute(
      `MERGE INTO EL_BIGOTE.password_resets pr
       USING (SELECT :email AS EMAIL FROM dual) source
       ON (pr.EMAIL = source.EMAIL)
       WHEN MATCHED THEN
         UPDATE SET TOKEN = :token, EXPIRES_AT = :expiresAt
       WHEN NOT MATCHED THEN
         INSERT (EMAIL, TOKEN, EXPIRES_AT) VALUES (:email, :token, :expiresAt)`,
      { email, token, expiresAt }
    );
    await conn.commit();

    // Step 5: Send the reset link to the user's email
    //TODO[val] - revisar enlace
    const resetLink = `http://localhost:5173/reset-password?token=${token}`;
    await sendForgotPasswordEmail(email, user.NOMBRE, resetLink);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    res.status(500).json({ message: 'There was an error processing the password reset request' });
  } finally {
    if (conn) await conn.close();
  }
});

// Endpoint
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  let conn;

  try {
    // Step 1: Connect to the database
    conn = await oracledb.getConnection(config);

    // Step 2: Retrieve the reset request by token from EL_BIGOTE.password_resets
    // TODO[val] - procedimiento almacenado
    const result = await conn.execute(
      `SELECT EMAIL, EXPIRES_AT FROM EL_BIGOTE.password_resets WHERE TOKEN = :token`,
      { token },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const resetRequest = result.rows[0];
    if (!resetRequest || new Date(resetRequest.EXPIRES_AT) < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Step 3: Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Step 4: Update the user's password in EL_BIGOTE.USUARIOS
    //TODO[val] - procedimiento almacenado
    await conn.execute(
      `UPDATE EL_BIGOTE.USUARIOS SET CONTRASENA = :hashedPassword WHERE CORREO = :email`,
      { hashedPassword, email: resetRequest.EMAIL }
    );

    // Step 5: Delete the reset request to invalidate the token
    //TODO[val] - procedimiento almacenado
    await conn.execute(`DELETE FROM EL_BIGOTE.password_resets WHERE TOKEN = :token`, { token });
    await conn.commit();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'There was an error resetting the password' });
  } finally {
    if (conn) await conn.close();
  }
});

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  requestPasswordReset,
  resetPassword
};

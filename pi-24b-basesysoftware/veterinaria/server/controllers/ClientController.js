const asyncHandler = require("express-async-handler");
const oracledb = require('oracledb')
const bcrypt = require('bcryptjs');
const config = require('../config/dbConfig');
const stripe = require('stripe')('sk_test_51QKY4o09Kygg2wKkC5U0yGjCyIByV5ZatV7vwlmtx7lA6CxctvspEPkWXL5M78VcXlh6Bq2y31SxYFXpycfZJVhS00sHFVy8gg');

const YOUR_DOMAIN = 'http://localhost:5173/clientes';

module.exports = {

  getCitaServicios: asyncHandler(async (req, res) => {
    let conn;
    const citaId = req.params.citaId; // Get cita ID from request parameters

    if (!citaId) {
      return res.status(400).json({ message: "Cita ID is required" });
    }

    try {
      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);

      console.log('Cita ID received:', citaId);


      const result = await conn.execute(
        `BEGIN 
          EL_BIGOTE.SelectAllServiciosGivenCita(:p_idCita, :p_error, :p_SelectAllServiciosGivenCitaCursor);
        END;`,
        {
          p_idCita: { dir: oracledb.BIND_IN, val: citaId },
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          p_SelectAllServiciosGivenCitaCursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );

      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error);
      }

      // Retrieve the result set from the REF CURSOR
      const resultSet = result.outBinds.p_SelectAllServiciosGivenCitaCursor;
      const servicios = await resultSet.getRows(); // Fetch all rows from the cursor
      console.log('Result set:', servicios);
      await resultSet.close(); // Close the cursor after fetching the data

      // Send the retrieved results as a JSON response
      res.json(servicios);

    } catch (err) {
      console.error("Error al obtener servicios de la cita:", err);
      res.status(500).json({ message: "Error al obtener servicios de la cita desde la base de datos" });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),

  viewClientProfile: asyncHandler(async (req, res) => {
    let conn;
    const id = req.params.id

    try {
      // Establish a connection to the database using the configuration settings
      conn = await oracledb.getConnection(config);

      const result = await conn.execute(
        `BEGIN 
          SelectClientProfile(:p_idClient, :p_error, :p_SelectClientProfileCursor);
        END;`,
        { 
          // Bind output parameters for the stored procedure
          p_idClient:{dir: oracledb.BIND_IN, val: id},
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          p_SelectClientProfileCursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );

      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error); // Throw an error if `p_error` is not null
      }

      // Retrieve the result set from the REF CURSOR in `p_SelectClientProfileCursor`
      const resultSet = result.outBinds.p_SelectClientProfileCursor;
      const results = await resultSet.getRows(); // Fetch all rows from the cursor

      // Send the retrieved results as a JSON response
      res.json(results);

    } catch (err) {
      // Log the error in Spanish to indicate an issue during retrieval
      console.log("Error al obtener perfil en la ruta /:", err);
      // Send a 500 response with a relevant error message in Spanish
      res.status(500).json({ message: "Error al obtener perfil desde la base de datos" });
    } finally {
      // Ensure the database connection is closed to free up resources
      if (conn) {
        await conn.close();
      }
    } 
  }),

  updateClientProfile: asyncHandler(async (req, res) => {
    let conn;

    // Extract details from the request body
    const id = req.body.ID;
    const nombre = req.body.NOMBRE;
    const apellido = req.body.APELLIDO;
    const correo = req.body.CORREO;
    const direccion = req.body.DIRECCION;

    try {
      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);

      const result = await conn.execute(
        `BEGIN 
          UpdateClientProfile(:p_idClient, :p_nombre, :p_apellido, :p_correo, :p_direccion, :p_error); 
        END;`,
        {
          // Bind input parameters
          p_idClient: { dir: oracledb.BIND_IN, val: id },
          p_nombre: { dir: oracledb.BIND_IN, val: nombre },
          p_apellido: { dir: oracledb.BIND_IN, val: apellido },
          p_correo: { dir: oracledb.BIND_IN, val: correo },
          p_direccion: { dir: oracledb.BIND_IN, val: direccion },
          // Bind output parameter to capture any error messages from the procedure
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
        }
      );
      
      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error); // Throw an error if `p_error` is not null
      }

      // Send a success response indicating the service update was successful
      res.status(200).json({ message: "Usuario actualizado exitosamente" });

    } catch (err) {
      // Log the error encountered during the service update
      console.error("Error actualizando al usuario:", err);
      // Send a 500 response with a relevant error message
      res.status(500).json({ message: "Error actualizando al usuario" });
    } finally {
      // Ensure the database connection is closed to free up resources
      if (conn) {
        await conn.close();
      }
    }
  }),

  checkPasswordMatch: asyncHandler(async (req, res) => {
    // Extract details from the request body
    const oldPassword = req.body.CONTRASENA_ACTUAL
    const hashedOldPassword = req.body.HASH

    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(oldPassword, hashedOldPassword);

    if (!passwordMatch) {
      return res.status(400).send({ message: 'Las contraseñas no son las mismas' });
    } else {
      console.log('passwords match')
      // Send a success response
      res.status(200).json({ message: "Contrasenas iguales" });
    }    
  }),

  updateClientPassword: asyncHandler(async (req, res) => {
    let conn;

    // Extract details from the request body
    const id = req.body.ID;

    // Hash the new password
    const newPassword = await bcrypt.hash(req.body.CONTRASENA_NUEVA, 10);
    console.log(req.body.CONTRASENA_NUEVA)
    console.log(newPassword)

    try {
      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);

      const result = await conn.execute(
        `BEGIN 
          UpdatePassword(:p_id, :p_contrasena, :p_error); 
        END;`,
        {
          // Bind input parameters
          p_id: { dir: oracledb.BIND_IN, val: id },
          p_contrasena: { dir: oracledb.BIND_IN, val: newPassword },
          // Bind output parameter to capture any error messages from the procedure
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
        }
      );
      
      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error); // Throw an error if `p_error` is not null
      }

      // Send a success response
      res.status(200).json({ message: "Contrasena actualizada exitosamente" });

    } catch (err) {
      // Log the error encountered
      console.error("Error actualizando la contrasena:", err);
      // Send a 500 response with a relevant error message
      res.status(500).json({ message: "Error actualizando la contrasena" });
    } finally {
      // Ensure the database connection is closed to free up resources
      if (conn) {
        await conn.close();
      }
    }
  }),


  clientCitasList: asyncHandler(async (req, res) => {
    let conn;
    const id = req.query.id; // Get client ID from the query parameter

    // Check if the client ID is present
    if (!id) {
      console.error("Client ID is missing");
      return res.status(400).json({ message: "Client ID is required" });
    }

    console.log("Client ID from req.query.id:", id);

    try {
      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);

      const result = await conn.execute(
        `BEGIN 
          SelectAllCliCitas(:p_idCliente, :p_error, :p_SelectAllCliCitasCursor);
        END;`,
        {
          p_idCliente: { dir: oracledb.BIND_IN, val: id },
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          p_SelectAllCliCitasCursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );

      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error);
      }

      // Retrieve the result set from the REF CURSOR in `p_SelectAllCliCitasCursor`
      const resultSet = result.outBinds.p_SelectAllCliCitasCursor;
      const results = await resultSet.getRows(); // Fetch all rows from the cursor

      // Close the result set after fetching the data
      await resultSet.close();

      // Send the retrieved results as a JSON response
      res.json(results);

    } catch (err) {
      // Log the error and respond with a 500 status code
      console.error("Error al obtener citas del cliente:", err);
      res.status(500).json({ message: "Error al obtener citas del cliente desde la base de datos" });
    } finally {
      // Ensure the database connection is closed to free up resources
      if (conn) {
        await conn.close();
      }
    }
  }),

  updateCitaEstado: asyncHandler(async (req, res) => {
    let conn;
    const citaId = req.params.citaId;
    const { estado } = req.body;
    console.log('citaId = ', citaId);
    console.log('estado = ', estado );
  
    if (!citaId || estado === undefined) {
      return res.status(400).json({ message: "Cita ID and estado are required" });
    }
  
    try {
      conn = await oracledb.getConnection(config);
  
      const result = await conn.execute(
        `BEGIN 
          EL_BIGOTE.UpdateCitaEstado(:p_idCita, :p_estado, :p_error);
        END;`,
        {
          p_idCita: { dir: oracledb.BIND_IN, val: citaId },
          p_estado: { dir: oracledb.BIND_IN, val: estado },
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
        }
      );
  
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error);
      }
  
      res.status(200).json({ message: "Cita estado updated successfully" });
    } catch (err) {
      console.error("Error updating cita estado:", err);
      res.status(500).json({ message: "Error updating cita estado in the database" });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),

  createCita: asyncHandler(async (req, res) => {
    let conn;
    const {
      id_mascota,
      id_usuario_vet,
      fecha,
      tipo_cita,
      id_usuario_cli,
    } = req.body;
  
    // Validate all required fields
    if (!id_mascota || !id_usuario_vet || !fecha || !tipo_cita || !id_usuario_cli) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
      conn = await oracledb.getConnection(config);
  
      // Prepare the bind variables, including the new output parameter
      const bindVars = {
        p_id_mascota: { dir: oracledb.BIND_IN, val: id_mascota },
        p_id_usuario_cli: { dir: oracledb.BIND_IN, val: id_usuario_cli },
        p_fecha: { dir: oracledb.BIND_IN, val: new Date(fecha) },
        p_tipo_cita: { dir: oracledb.BIND_IN, val: tipo_cita },
        p_id_usuario_vet: { dir: oracledb.BIND_IN, val: id_usuario_vet },
        p_new_cita_id: { dir: oracledb.BIND_OUT,  type: oracledb.STRING, maxSize: 50 }, // New output parameter
        p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
      };
  
      const result = await conn.execute(
        `BEGIN 
            EL_BIGOTE.CreateCita(
              :p_id_mascota, 
              :p_id_usuario_cli, 
              :p_fecha, 
              :p_tipo_cita, 
              :p_id_usuario_vet, 
              :p_new_cita_id, 
              :p_error
            );
        END;`,
        bindVars
      );
  
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error);
      }
  
      // Return the new cita ID to the client
      res.status(201).json({
        message: "Cita creada exitosamente",
        citaId: result.outBinds.p_new_cita_id,
      });
    } catch (err) {
      console.error("Error creating cita:", err);
      res.status(500).json({
        message: "Error creating cita in the database",
        error: err.message,
      });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),


  // Function to fetch all active services
  fetchServicios: asyncHandler(async (req, res) => {
    let conn;

    try {
      conn = await oracledb.getConnection(config);

      const result = await conn.execute(
        `SELECT ID_SERVICIO, NOMBRE, PRECIO_ACTUAL FROM servicios WHERE ESTADO = 1`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching servicios:', err);
      res.status(500).json({ message: 'Error fetching servicios', error: err.message });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),

  clientMascotasList: asyncHandler(async (req, res) => {
    let conn;
    const id = req.params.id; // Get client ID from authenticated user

    try {
      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);

      const result = await conn.execute(
        `BEGIN 
          getClienteMascotas (:p_userID, :p_error, :p_cursorGetClienteMascotas);
        END;`,
        {
          p_userID: { dir: oracledb.BIND_IN, val: id },
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          p_cursorGetClienteMascotas: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        }
      );

      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error);
      }

      // Retrieve the result set from the REF CURSOR
      const resultSet = result.outBinds.p_cursorGetClienteMascotas;
      const results = await resultSet.getRows(); // Fetch all rows from the cursor

      // Map the results to an array of objects with meaningful keys
      const mascotas = results.map((row) => ({
        ID_MASCOTA: row[2], // Assuming PET_ID is at index 2
        NOMBRE: row[3],     // Assuming PET_NAME is at index 3
        ESPECIE: row[4],    // Assuming SPECIES is at index 4
        // Add other properties as needed
      }));

      // Send the mapped results as a JSON response
      res.json(mascotas);
    } catch (err) {
      // Log the error and respond with a 500 status code
      console.error("Error al obtener mascotas del cliente:", err);
      res.status(500).json({ message: "Error al obtener mascotas del cliente desde la base de datos" });
    } finally {
      // Ensure the database connection is closed to free up resources
      if (conn) {
        await conn.close();
      }
    }
  }),

  clientMascotAddPost: asyncHandler(async (req, res,) => {
    try {
        const conn = await oracledb.getConnection(config);
        
        //se recupera la info del cliente del request
        const USR_ID = req.body.USR_ID;
        const MASCOT_ID = req.body.MASCOT_ID;
        const NAME = req.body.NAME;
        const SPECIES = req.body.SPECIES;
        const BREED = req.body.BREED
        const AGE = req.body.AGE
        const WEIGHT = parseFloat(req.body.WEIGHT);

        const resultMascotExists = await conn.execute(
          `BEGIN MascotExists(:p_idMascota, :p_error, :p_cursorMascotExists); END;`,
          {
            p_idMascota: {dir: oracledb.BIND_IN, val: MASCOT_ID},
            p_error: {dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200},
            p_cursorMascotExists: {dir: oracledb.BIND_OUT, type: oracledb.CURSOR}
          }
      )
  
      if (resultMascotExists.outBinds.p_error != null) {  
        throw new Error(resultMascotExists.outBinds.p_error);
      }
  
      const resultSet = resultMascotExists.outBinds.p_cursorMascotExists;
      
      const countRowMascot = await resultSet.getRow();
      const mascotExists = countRowMascot[0] > 0;
      
      const resultCheckUser = await conn.execute(
        `BEGIN UserExists(:p_idUsuario, :p_error, :p_cursorUserExists); END;`,
        {
          p_idUsuario: {dir: oracledb.BIND_IN, val: USR_ID},
          p_error: {dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200},
          p_cursorUserExists: {dir: oracledb.BIND_OUT, type: oracledb.CURSOR}
        }
    )

    if (resultCheckUser.outBinds.p_error != null) {  
      throw new Error(resultCheckUser.outBinds.p_error);
    }

    const resultSetCheckUser = resultCheckUser.outBinds.p_cursorUserExists;
    
    const countRow = await resultSetCheckUser.getRow();
    const userExists = countRow[0] > 0;

        if (!userExists) {
          res.json({ userExists: false });
        } else if (!mascotExists) {
          const resultAdd = await conn.execute(
            `BEGIN AddMascot(:p_id_mascota, :p_id_usuario, :p_edad, :p_especie, :p_peso, :p_raza, 
              :p_nombre, :p_error); END;`,
              {
                p_id_mascota: {dir:oracledb.BIND_IN, val: MASCOT_ID},
                p_id_usuario: {dir:oracledb.BIND_IN, val: USR_ID},
                p_edad: {dir:oracledb.BIND_IN, val: AGE},
                p_especie: {dir:oracledb.BIND_IN, val: SPECIES},
                p_peso: {dir:oracledb.BIND_IN, val: WEIGHT},
                p_raza: {dir:oracledb.BIND_IN, val: BREED},
                p_nombre: {dir:oracledb.BIND_IN, val: NAME},
                p_error: {dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200}
              }
          );

          if (resultAdd.outBinds.p_error != null) {  
            throw new Error(resultAdd.outBinds.p_error);
          }
            res.status(201).json({ message: "Mascota creado exitosamente", userExists: true, mascotsExists: false}); 
        } else {
            console.error("Ya existe una mascota con ese nombre de usuario")
            res.json({ mascotsExists: true });
        }
    } catch (err) {
    
        console.error("Error creando mascota:", err);
        res.status(500).json({ error: "Error creando mascota" });
    } finally {
        if (conn) {
            await conn.close();
        }
    }
    
    }),

    speciesList: asyncHandler(async (req, res,) => {
      let conn;
      try {
        console.log("Estoy en getEspecies")
          conn = await oracledb.getConnection(config) 
          const result = await conn.execute(
            `BEGIN 
               GetEspecies(:p_error, :p_cursorGetEspecies); 
             END;`,
            {
              p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
              p_cursorGetEspecies: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } 
            }
          );
          if (result.outBinds.p_error != null) {
            throw new Error(result.outBinds.p_error)
          }
          // Get the result set from the REF CURSOR
          const resultSet = result.outBinds.p_cursorGetEspecies; 
          const species = await resultSet.getRows();
          res.json(species); 
      } catch (err) {
        console.log(err)
          res.status(500).json({ message: "Error retrieving mascots from DB" });
      } finally {
          if (conn) {
              await conn.close();
          }
      }
    }),

    breedsList: asyncHandler(async (req, res,) => {
      let conn;
      try {
        //console.log("Estoy en mascotList")
          conn = await oracledb.getConnection(config) 
          const result = await conn.execute(
            `BEGIN 
               GetRazas(:p_error, :p_cursorGetRazas); 
             END;`,
            {
              p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
              p_cursorGetRazas: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } 
            }
          );
          if (result.outBinds.p_error != null) {
            throw new Error(result.outBinds.p_error)
          }
          // Get the result set from the REF CURSOR
          const resultSet = result.outBinds.p_cursorGetRazas; 
          const breeds = await resultSet.getRows();
          res.json(breeds); 
      } catch (err) {
        console.log(err)
          res.status(500).json({ message: "Error retrieving mascots from DB" });
      } finally {
          if (conn) {
              await conn.close();
          }
      }
    }),

    mascotUpdatePut: asyncHandler(async (req, res,) => {
      const id = req.body.MASCOT_ID
      const mascotName = req.body.NAME;
      const mascotAge = req.body.AGE;
      const mascotWeight = parseFloat(req.body.WEIGHT);
      let conn;
      try {
          conn = await oracledb.getConnection(config);
  
          const result = await conn.execute(
            `BEGIN UpdateMascota(:p_idMascota, :p_nombre, :p_edad, :p_peso, :p_error); END;`,
            {
              p_idMascota: {dir: oracledb.BIND_IN, val: id},
              p_nombre: {dir:oracledb.BIND_IN, val: mascotName},
              p_edad: {dir: oracledb.BIND_IN, val: mascotAge},
              p_peso:{dir: oracledb.BIND_IN, val: mascotWeight},
              p_error: {dir:oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200}
            }
          )
  
          if (result.outBinds.p_error != null) {
            throw new Error(result.outBinds.p_error)
          }
  
          await conn.commit()
          console.log("Actualicé a una mascotas de la base de datos")
          res.status(200).json({ message: "Mascot Updated successfully" }); 
          
      } catch (err) {
          res.status(500).json({ message: "Mascot Failed to update" }); 
      } finally {
          if (conn) {
              await conn.close();
          }
      }
    }),

    mascotDeletePut: asyncHandler(async (req, res,) => {
      const mascotId = req.body.MASCOT_ID
      const mascotNewEstado = req.body.ESTADO
  
      try {
          let conn = await oracledb.getConnection(config);
          const result = await conn.execute(
            `BEGIN DeleteMascota(:p_idMascota, :p_nuevoEstado, :p_error); END;`, 
            {
              p_idMascota:{dir: oracledb.BIND_IN, val: mascotId},
              p_nuevoEstado: {dir: oracledb.BIND_IN, val: mascotNewEstado},
              p_error: {dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200}
            }
        )
        await conn.commit()
        if (result.outBinds.p_error != null) {
          throw new Error(result.outBinds.p_error)
        }
          await conn.commit()
          res.status(200).json({ message: "Mascot deleted successfully" }); 
          
      } catch (err) {
          res.status(500).json({ message: "Failed to delete mascot" }); 
      } finally {
          if (conn) {
              await conn.close();
          }
      }
    }),

    medHistoryList: asyncHandler(async (req, res,) => {
      let conn
  
      const id = req.params.id
      //console.log("estoy en med history list de: " + id)
      try {
        conn = await oracledb.getConnection(config) 
  
        const result = await conn.execute(
          `BEGIN 
            SelectMedicalHistory(:p_idMascot, :p_error, :p_SelectMedicalHistoryCursor);
          END;`,
          { 
            p_idMascot:{dir: oracledb.BIND_IN, val: id},
            p_error: {dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200},
            p_SelectMedicalHistoryCursor: {dir: oracledb.BIND_OUT, type: oracledb.CURSOR}
          }
        );
        if (result.outBinds.p_error != null) {
          throw new Error(result.outBinds.p_error)
        }
        // Get the result set from the REF CURSOR
        const resultSet = result.outBinds.p_SelectMedicalHistoryCursor; 
        const results = await resultSet.getRows();
        res.json(results); 
      } catch (err) {
        console.log("Error en ruta /mascotas/:id:" + err);
        // Send a success response with a relevant message
        res.status(500).json({ message: "Error retrieving med history from DB" }); 
      } finally {
        if (conn) {
          await conn.close();
        }
      }
    }),
  
    diagnosticList: asyncHandler(async (req, res,) => {
      let conn
  
      try {
        conn = await oracledb.getConnection(config) 
  
        const result = await conn.execute(
          `BEGIN 
            SelectAllDiagnoses(:p_error, :p_SelectAllDiagnosesCursor);
          END;`,
          { 
            p_error: {dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200},
            p_SelectAllDiagnosesCursor: {dir: oracledb.BIND_OUT, type: oracledb.CURSOR}
          }
        );
        if (result.outBinds.p_error != null) {
          throw new Error(result.outBinds.p_error)
        }
        // Get the result set from the REF CURSOR
        const resultSet = result.outBinds.p_SelectAllDiagnosesCursor; 
        const results = await resultSet.getRows();
        res.json(results); 
      } catch (err) {
        console.log("Error en ruta /diagnosticos:" + err);
        // Send a success response with a relevant message
        res.status(500).json({ message: "Error retrieving diagnosticos from DB" }); 
      } finally {
        if (conn) {
          await conn.close();
        }
      }
    }),
  
    treatmentList: asyncHandler(async (req, res,) => {
      let conn
  
      try {
        conn = await oracledb.getConnection(config) 
  
        const result = await conn.execute(
          `BEGIN 
            SelectAllTreatments(:p_error, :p_SelectAllTreatmentsCursor);
          END;`,
          { 
            p_error: {dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200},
            p_SelectAllTreatmentsCursor: {dir: oracledb.BIND_OUT, type: oracledb.CURSOR}
          }
        );
        if (result.outBinds.p_error != null) {
          throw new Error(result.outBinds.p_error)
        }
        // Get the result set from the REF CURSOR
        const resultSet = result.outBinds.p_SelectAllTreatmentsCursor; 
        const results = await resultSet.getRows();
        res.json(results); 
      } catch (err) {
        console.log("Error en ruta /tratamientos:" + err);
        // Send a success response with a relevant message
        res.status(500).json({ message: "Error retrieving tratamientos from DB" }); 
      } finally {
        if (conn) {
          await conn.close();
        }
      }
    }),
    
    medHistoryCitasList: asyncHandler(async (req, res) => {
      let conn;
  
      const id = req.params.id
  
      try {
        //console.log("estoy en historial citas list de: " + id)
        conn = await oracledb.getConnection(config) 
  
        const result = await conn.execute(
          `BEGIN 
            SelectHistorialCitas(:p_idMascot, :p_error, :p_SelectHistorialCitasCursor);
          END;`,
          { 
            p_idMascot:{dir: oracledb.BIND_IN, val: id},
            p_error: {dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200},
            p_SelectHistorialCitasCursor: {dir: oracledb.BIND_OUT, type: oracledb.CURSOR}
          }
        );
        if (result.outBinds.p_error != null) {
          throw new Error(result.outBinds.p_error)
        }
        // Get the result set from the REF CURSOR
        const resultSet = result.outBinds.p_SelectHistorialCitasCursor; 
        const results = await resultSet.getRows();
        res.json(results); 
      } catch (err) {
        console.log("Error en ruta /mascotas/citas/:id:" + err);
        // Send a success response with a relevant message
        res.status(500).json({ message: "Error retrieving citas history from DB" }); 
      } finally {
        if (conn) {
          await conn.close();
        }
      }
    }),
  
  PagosList: asyncHandler(async (req, res) => {
    let conn;
    const id = req.params.id

    console.log(id)

    try {
      // Establish a connection to the database using the configuration settings
      conn = await oracledb.getConnection(config);

      const result = await conn.execute(
        `BEGIN 
          SelectClientPayments(:p_idClient, :p_error, :p_SelectClientPaymentsCursor);
        END;`,
        { 
          // Bind output parameters for the stored procedure
          p_idClient:{dir: oracledb.BIND_IN, val: id},
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          p_SelectClientPaymentsCursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );

      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error); // Throw an error if `p_error` is not null
      }

      // Retrieve the result set from the REF CURSOR
      const resultSet = result.outBinds.p_SelectClientPaymentsCursor;
      const results = await resultSet.getRows(); // Fetch all rows from the cursor

      // Send the retrieved results as a JSON response
      res.json(results);

    } catch (err) {
      // Log the error in Spanish to indicate an issue during retrieval
      console.log("Error al obtener los pagos en la ruta /:", err);
      // Send a 500 response with a relevant error message in Spanish
      res.status(500).json({ message: "Error al obtener los pagos desde la base de datos" });
    } finally {
      // Ensure the database connection is closed to free up resources
      if (conn) {
        await conn.close();
      }
    } 
  
  }),
  
  CitasServiciosList: asyncHandler(async (req, res) => {
    let conn;
    const id = req.params.id

    console.log(id)

    try {
      // Establish a connection to the database using the configuration settings
      conn = await oracledb.getConnection(config);

      const result = await conn.execute(
        `BEGIN 
          SelectClientServices(:p_idClient, :p_error, :p_SelectClientServicesCursor);
        END;`,
        { 
          // Bind output parameters for the stored procedure
          p_idClient:{dir: oracledb.BIND_IN, val: id},
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          p_SelectClientServicesCursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );

      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error); // Throw an error if `p_error` is not null
      }

      // Retrieve the result set from the REF CURSOR
      const resultSet = result.outBinds.p_SelectClientServicesCursor;
      const results = await resultSet.getRows(); // Fetch all rows from the cursor

      // Send the retrieved results as a JSON response
      res.json(results);

    } catch (err) {
      // Log the error in Spanish to indicate an issue during retrieval
      console.log("Error al obtener los servicioa de las citas en la ruta /:", err);
      // Send a 500 response with a relevant error message in Spanish
      res.status(500).json({ message: "Error al obtener los servicios de las citas desde la base de datos" });
    } finally {
      // Ensure the database connection is closed to free up resources
      if (conn) {
        await conn.close();
      }
    } 
  
  }),

  clientCheckout: asyncHandler(async (req, res) => {
    const id_pago = req.body.ID_PAGO

    const lineItems = req.body.CITAS_SERVICIOS.map((service) => ({
      price_data: {
        currency: "crc",
        product_data: {
          name: service.NOMBRE,
        },
        unit_amount: service.PRECIO * 100,
      },
      quantity: 1
    }))

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: lineItems,
      mode: 'payment',
      return_url: `${YOUR_DOMAIN}/pagos/${id_pago}/retorno?session_id={CHECKOUT_SESSION_ID}`,
      locale: 'es',
      redirect_on_completion: 'if_required'
    });

    console.log(session.id)
    res.send({clientSecret: session.client_secret, sessionID: session.id, id_pago: id_pago});

  }),

  clientSessionStatus: asyncHandler(async (req, res) => {
    console.log('in the session status function')
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    // console.log(session)

    res.send({
      status: session.status,
      customer_email: session.customer_details.email
    });

  }),

  clientPaymentMethod: asyncHandler(async (req, res) => {
    let brand;
    let last4;
    console.log('in the payment method function')
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    if (session) {
      // console.log(session)
      const paymentIntent = session.payment_intent;

      // Retrieve the payment method associated with the payment intent
      const paymentIntentDetails = await stripe.paymentIntents.retrieve(paymentIntent);
      if (paymentIntentDetails) {
        const paymentMethod = paymentIntentDetails.payment_method;
        const paymentMethodDetails = await stripe.paymentMethods.retrieve(paymentMethod);
        brand = paymentMethodDetails.card.brand
        last4 = paymentMethodDetails.card.last4
       }
    }
    res.send({
      card_brand: brand,
      card_last4: last4
    });

  }),

  clientPaymentComplete: asyncHandler(async (req, res) => {
    console.log("Entre a actualizar el estatus del pago")
    let conn;
    const id = req.body.id
    const paymentMethod = req.body.paymentMethod
    console.log(req.body.id)
    console.log(req.body.paymentMethod)

    try {
        conn = await oracledb.getConnection(config)

        const result = await conn.execute(
          `BEGIN PaymentCompleted(:p_idPago, :p_metodoPago, :p_error); END;`,
          {
            p_idPago: {dir: oracledb.BIND_IN, val: id},
            p_metodoPago: {dir: oracledb.BIND_IN, val: paymentMethod},
            p_error: {dir:oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200}
          }
        )

        if (result.outBinds.p_error != null) {
          throw new Error(result.outBinds.p_error)
        }

        await conn.commit()
        console.log("Actualicé el estatus del pago")
        res.status(200).json({ message: "Payment Updated successfully" }); 
        
    } catch (err) {
        res.status(500).json({ message: "Payment Failed to update" }); 
    } finally {
        if (conn) {
            await conn.close();
        }
    }

  }),

  // Function to retrieve all cita_servicios associated with a given cita_id
  getCitaServiciosByCitaId: asyncHandler(async (req, res) => {
    let conn;
    const citaId = req.params.citaId; // Get cita ID from request parameters

    if (!citaId) {
      return res.status(400).json({ message: "Cita ID is required" });
    }

    try {
      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);

      const result = await conn.execute(
        `SELECT id_cita, id_servicio, nombre_servicio, precio 
         FROM cita_servicios
         WHERE id_cita = :citaId`,
        [citaId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching cita_servicios:", err);
      res.status(500).json({ message: "Error fetching cita_servicios", error: err.message });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),
  
  clientCalendar: asyncHandler(async (req, res,) => {
    let conn
    const id = req.params.id

    try {
      conn = await oracledb.getConnection(config) 

      const result = await conn.execute(
        `BEGIN 
          SELECTCLIENTCALENDAR(:p_idCli, :p_error, :p_SelectCliCalendarCursor);
        END;`,
        { 
          p_idCli:{dir: oracledb.BIND_IN, val: id},
          p_error: {dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200},
          p_SelectCliCalendarCursor: {dir: oracledb.BIND_OUT, type: oracledb.CURSOR}
        }
      );
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error)
      }
      // Get the result set from the REF CURSOR
      const resultSet = result.outBinds.p_SelectCliCalendarCursor; 
      const results = await resultSet.getRows();
      //console.log("Las citas próximas son: " + results)
      res.json(results); 
    } catch (err) {
      console.log("Error en ruta /calendario:" + err);
      // Send a success response with a relevant message
      res.status(500).json({ message: "Error retrieving vet calendar from DB" }); 
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),


  fetchMascotas: asyncHandler(async (req, res) => {
    let conn;
    const userId = req.params.userId;
    console.log(' el user ID recibido es ', userId);
  
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
  
    try {
      conn = await oracledb.getConnection(config);
  
      const result = await conn.execute(
        `BEGIN 
           EL_BIGOTE.GetMascotasForClient(:p_userId, :p_cursor, :p_error);
         END;`,
        {
          p_userId: { dir: oracledb.BIND_IN, val: userId },
          p_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
        }
      );
      
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error);
      }
      
      const resultSet = result.outBinds.p_cursor;
      const rows = await resultSet.getRows();
      await resultSet.close();
      
      // Map the rows to objects with meaningful property names
      const mascotas = rows.map(row => ({
        ID_MASCOTA: row[0],
        NOMBRE: row[1],
        ESPECIE: row[2],
      }));
  
      console.log('Mapped mascotas:', mascotas);
  
      res.json(mascotas);
  
    } catch (err) {
      console.error('Error fetching mascotas:', err);
      res.status(500).json({ message: 'Error fetching mascotas', error: err.message });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),
  

  fetchVeterinarians: asyncHandler(async (req, res) => {
    let conn;
  
    try {
      conn = await oracledb.getConnection(config);
  
      const result = await conn.execute(
        `BEGIN 
           ADMIN.AdminFetchActiveVeterinarians(:p_cursor, :p_error);
        END;`,
        {
          p_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
        }
      );
      console.log('Veterinarians data fetched:', res.data);
  
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error);
      }
  
      const resultSet = result.outBinds.p_cursor;
      const rows = await resultSet.getRows();
      await resultSet.close();


      const veterinarians = rows.map(row => ({
        ID_USUARIO: row[0],
        NOMBRE: row[1],
        APELLIDO: row[2],
        // Add other fields as necessary
      }));
  
      res.json(veterinarians);
    } catch (err) {
      console.error('Error fetching veterinarians:', err);
      res.status(500).json({ message: 'Error fetching veterinarians', error: err.message });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),

  fetchTipoCitas: asyncHandler(async (req, res) => {
    let conn;
  
    try {
      conn = await oracledb.getConnection(config);
  
      const result = await conn.execute(
        `BEGIN
            ADMIN.AdminFetchActiveTiposCita(:p_cursor, :p_error);
        END;`,
        {
          p_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
        }
      );
  
      // Check for any errors returned by the stored procedure
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error);
      }
  
      // Retrieve the result set from the cursor
      const resultSet = result.outBinds.p_cursor;
      const rows = await resultSet.getRows();
      await resultSet.close();
  
      // Log the fetched data for debugging purposes
      console.log('tipoCitas data fetched:', rows);
  
      // Check if rows are defined and map them if necessary
      if (!rows || rows.length === 0) {
        console.warn('No tipoCitas found.');
        res.json([]); // Send an empty array if no data is found
        return;
      }
  
      // Map the rows to objects with meaningful property names
      const tipoCitas = rows.map(row => ({
        ID_TIPO: row[0],
        NOMBRE: row[1],
        // Add more fields as necessary based on the database schema
      }));
  
      // Send the mapped data to the client
      res.json(tipoCitas);
    } catch (err) {
      console.error('Error fetching tipos de cita:', err);
      res.status(500).json({ message: 'Error fetching tipos de cita', error: err.message });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),


  getAvailableTimes: asyncHandler(async (req, res) => {
    const { date, vetId, clientId, petId } = req.query;
    let conn;
  
    // Validate input parameters
    if (!date || !vetId || !clientId || !petId) {
      return res.status(400).json({ message: "Date, vetId, clientId, and petId are required" });
    }
  
    try {
      conn = await oracledb.getConnection(config);
  
      const result = await conn.execute(
        `BEGIN
            EL_BIGOTE.GetAvailableTimes(:p_date_value, :p_vet_id_value, :p_client_id_value, :p_pet_id_value, :p_booked_hours, :p_error);
        END;`,
        {
          p_date_value: { dir: oracledb.BIND_IN, val: date },
          p_vet_id_value: { dir: oracledb.BIND_IN, val: vetId },
          p_client_id_value: { dir: oracledb.BIND_IN, val: clientId },
          p_pet_id_value: { dir: oracledb.BIND_IN, val: petId },
          p_booked_hours: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
        }
      );
  
      // Handle procedure errors
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error);
      }
  
      // Process the cursor to retrieve booked hours
      const bookedHoursRows = [];
      const resultSet = result.outBinds.p_booked_hours;
  
      if (resultSet) {
        let row;
        while ((row = await resultSet.getRow())) {
          const formattedHour = row[0].padStart(2, '0') + ":00";
          bookedHoursRows.push(formattedHour);
        }
        await resultSet.close();
      }
  
      // Generate all possible hours from "08:00" to "21:00"
      const allHours = Array.from({ length: 14 }, (_, i) => `${(8 + i).toString().padStart(2, '0')}:00`);
  
      // Filter out booked hours
      const availableHours = allHours.filter(hour => !bookedHoursRows.includes(hour));
  
      res.json(availableHours);
    } catch (err) {
      console.error("Error fetching available times:", err);
      res.status(500).json({ error: "Error fetching available times" });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),
  
  updateCita: asyncHandler(async (req, res) => {
    let conn;
    const citaId = req.params.citaId; // Get cita ID from URL parameters
    const { fecha } = req.body; // Expecting 'fecha' in 'YYYY-MM-DD HH24:MI' format
  
    if (!citaId || !fecha) {
      return res.status(400).json({ message: "Cita ID and new fecha are required" });
    }
  
    try {
      conn = await oracledb.getConnection(config);
  
      console.log("Executing UPDATE statement to update cita fecha...");
  
      const result = await conn.execute(
        `UPDATE citas 
         SET fecha = TO_DATE(:p_new_fecha, 'YYYY-MM-DD HH24:MI') 
         WHERE id_cita = :p_id_cita`,
        {
          p_new_fecha: fecha,
          p_id_cita: citaId,
        },
        { autoCommit: true } // Ensure that the transaction is committed
      );
  
      if (result.rowsAffected > 0) {
        res.status(200).json({ message: "Fecha de cita actualizada exitosamente" });
      } else {
        res.status(404).json({ message: "Cita no encontrada" });
      }
    } catch (err) {
      console.error("Error actualizando fecha de cita", err);
      res.status(500).json({ error: "Error actualizando fecha de cita", details: err.message });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),

  // Function to delete all cita_servicios associated with a given cita_id
  deleteCitaServiciosByCitaId: asyncHandler(async (req, res) => {
    let conn;
    const citaId = req.params.citaId;

    if (!citaId) {
      return res.status(400).json({ message: "Cita ID is required" });
    }

    try {
      conn = await oracledb.getConnection(config);

      const result = await conn.execute(
        `DELETE FROM cita_servicios
         WHERE id_cita = :citaId`,
        [citaId],
        { autoCommit: true }
      );

      res.json({ message: `Deleted ${result.rowsAffected} cita_servicios for cita_id ${citaId}` });
    } catch (err) {
      console.error("Error deleting cita_servicios:", err);
      res.status(500).json({ message: "Error deleting cita_servicios", error: err.message });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),

  // Function to create a cita_servicio given a cita_id and servicio_id
  createCitaServicio: asyncHandler(async (req, res) => {
    let conn;
    const { citaId, servicioId } = req.body;

    if (!citaId || !servicioId) {
      return res.status(400).json({ message: "Cita ID and Servicio ID are required" });
    }

    try {
      conn = await oracledb.getConnection(config);

      // First, get the servicio details
      const servicioResult = await conn.execute(
        `SELECT NOMBRE, PRECIO_ACTUAL FROM servicios WHERE ID_SERVICIO = :servicioId`,
        [servicioId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (servicioResult.rows.length === 0) {
        return res.status(404).json({ message: "Servicio not found" });
      }

      const { NOMBRE, PRECIO_ACTUAL } = servicioResult.rows[0];

      // Now insert into cita_servicios
      const insertResult = await conn.execute(
        `INSERT INTO cita_servicios (id_cita, id_servicio, nombre_servicio, precio)
         VALUES (:citaId, :servicioId, :nombre_servicio, :precio)`,
        {
          citaId,
          servicioId,
          nombre_servicio: NOMBRE,
          precio: PRECIO_ACTUAL
        },
        { autoCommit: true }
      );

      res.status(201).json({ message: "Cita_servicio created successfully" });
    } catch (err) {
      console.error("Error creating cita_servicio:", err);
      res.status(500).json({ message: "Error creating cita_servicio", error: err.message });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),

  clientMascotasListDash: asyncHandler(async (req, res) => {
    let conn;
    const id = req.params.id; // Get client ID from authenticated user
    //console.log("Client ID from req.user.id:", id);   
    try {
      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);
  
      const result = await conn.execute(
        `BEGIN 
          getClienteMascotas (:p_userID, :p_error, :p_cursorGetClienteMascotas);
        END;`,
        {
          p_userID: { dir: oracledb.BIND_IN, val: id },
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          p_cursorGetClienteMascotas: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );
  
      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error);
      }
  
      // Retrieve the result set from the REF CURSOR in `p_SelectAllCliCitasCursor`
      const resultSet = result.outBinds.p_cursorGetClienteMascotas;
      const results = await resultSet.getRows(); // Fetch all rows from the cursor
  
      // Send the retrieved results as a JSON response
      res.json(results);
  
    } catch (err) {
      // Log the error and respond with a 500 status code
      console.error("Error al obtener mascotas del cliente:", err);
      res.status(500).json({ message: "Error al obtener mascotas del cliente desde la base de datos" });
    } finally {
      // Ensure the database connection is closed to free up resources
      if (conn) {
        await conn.close();
      }
    }
  }),

  getCitaServiciosByCitaIdCli: asyncHandler(async (req, res) => {
    let conn;
    const citaId = req.params.citaId; // Get cita ID from request parameters

    if (!citaId) {
      return res.status(400).json({ message: "Cita ID is required" });
    }

    try {
      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);

      const result = await conn.execute(
        `SELECT id_cita, id_servicio, nombre_servicio, precio 
         FROM cita_servicios
         WHERE id_cita = :citaId`,
        [citaId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      //console.log("Los resultados son: " + JSON.stringify(result.rows))
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching cita_servicios:", err);
      res.status(500).json({ message: "Error fetching cita_servicios", error: err.message });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),

  clientCalendarDash: asyncHandler(async (req, res,) => {
    let conn
    const id = req.params.id

    try {
      conn = await oracledb.getConnection(config) 

      const result = await conn.execute(
        `BEGIN 
          SELECTCLIENTCALENDAR(:p_idCli, :p_error, :p_SelectCliCalendarCursor);
        END;`,
        { 
          p_idCli:{dir: oracledb.BIND_IN, val: id},
          p_error: {dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200},
          p_SelectCliCalendarCursor: {dir: oracledb.BIND_OUT, type: oracledb.CURSOR}
        }
      );
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error)
      }
      // Get the result set from the REF CURSOR
      const resultSet = result.outBinds.p_SelectCliCalendarCursor; 
      const results = await resultSet.getRows();
      //console.log("Las citas próximas son: " + results)
      res.json(results); 
    } catch (err) {
      console.log("Error en ruta /calendario:" + err);
      // Send a success response with a relevant message
      res.status(500).json({ message: "Error retrieving vet calendar from DB" }); 
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),
}

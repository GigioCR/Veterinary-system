const asyncHandler = require("express-async-handler");
const oracledb = require('oracledb')
const bcrypt = require('bcryptjs');
const config = require('../config/dbConfig');

module.exports = {
  viewVetProfile: asyncHandler(async (req, res) => {
    let conn;
    const id = req.params.id

    try {
      // Establish a connection to the database using the configuration settings
      conn = await oracledb.getConnection(config);

      const result = await conn.execute(
        `BEGIN 
          SelectVetProfile(:p_idVet, :p_error, :p_SelectVetProfileCursor);
        END;`,
        { 
          // Bind output parameters for the stored procedure
          p_idVet:{dir: oracledb.BIND_IN, val: id},
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          p_SelectVetProfileCursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );

      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error); // Throw an error if `p_error` is not null
      }

      // Retrieve the result set from the REF CURSOR in `p_SelectAdminProfileCursor`
      const resultSet = result.outBinds.p_SelectVetProfileCursor;
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

  updateVetProfile: asyncHandler(async (req, res) => {
    let conn;

    // Extract details from the request body
    const id = req.body.ID;
    const nombre = req.body.NOMBRE;
    const apellido = req.body.APELLIDO;
    const correo = req.body.CORREO;

    try {
      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);

      const result = await conn.execute(
        `BEGIN 
          UpdateVetProfile(:p_idVet, :p_nombre, :p_apellido, :p_correo, :p_error); 
        END;`,
        {
          // Bind input parameters
          p_idVet: { dir: oracledb.BIND_IN, val: id },
          p_nombre: { dir: oracledb.BIND_IN, val: nombre },
          p_apellido: { dir: oracledb.BIND_IN, val: apellido },
          p_correo: { dir: oracledb.BIND_IN, val: correo },
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
    const id = req.body.ID;
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

  updateVetPassword: asyncHandler(async (req, res) => {
    let conn;

    // Extract details from the request body
    const id = req.body.ID;
    const oldPassword = req.body.CONTRASENA_ACTUAL
    const hashedOldPassword = req.body.HASH

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

  vetStats: asyncHandler(async (req, res,) => {
    let conn
    const id = req.params.id

    try {
      conn = await oracledb.getConnection(config) 

      const result = await conn.execute(
        `BEGIN 
          SelectVetStats(:p_idVet, :p_error, :p_SelectVetStatsCursor);
        END;`,
        { 
          p_idVet:{dir: oracledb.BIND_IN, val: id},
          p_error: {dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200},
          p_SelectVetStatsCursor: {dir: oracledb.BIND_OUT, type: oracledb.CURSOR}
        }
      );
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error)
      }
      // Get the result set from the REF CURSOR
      const resultSet = result.outBinds.p_SelectVetStatsCursor; 
      const results = await resultSet.getRows();
      res.json(results); 
    } catch (err) {
      console.log("Error en ruta /:" + err);
      // Send a success response with a relevant message
      res.status(500).json({ message: "Error retrieving vet stats from DB" }); 
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),

  vetCalendar: asyncHandler(async (req, res,) => {
    let conn
    const id = req.params.id

    try {
      conn = await oracledb.getConnection(config) 

      const result = await conn.execute(
        `BEGIN 
          SelectVetCalendar(:p_idVet, :p_error, :p_SelectVetCalendarCursor);
        END;`,
        { 
          p_idVet:{dir: oracledb.BIND_IN, val: id},
          p_error: {dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200},
          p_SelectVetCalendarCursor: {dir: oracledb.BIND_OUT, type: oracledb.CURSOR}
        }
      );
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error)
      }
      // Get the result set from the REF CURSOR
      const resultSet = result.outBinds.p_SelectVetCalendarCursor; 
      const results = await resultSet.getRows();
      console.log("Las citas próxima son: " + results)
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

  citaList: asyncHandler(async (req, res) => {
    let conn;
    const id = req.params.id;
  
    try {
      conn = await oracledb.getConnection(config);
  
      const result = await conn.execute(
        `BEGIN 
          SelectAllVetCitas(:p_idVet, :p_error, :p_SelectAllVetCitasCursor);
        END;`,
        {
          p_idVet: { dir: oracledb.BIND_IN, val: id },
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          p_SelectAllVetCitasCursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        }
      );
  
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error);
      }
  
      const resultSet = result.outBinds.p_SelectAllVetCitasCursor;
      console.log("MetaData:", resultSet.metaData); // Log metadata to check field names
      const results = await resultSet.getRows();
      console.log("Results:", results);
  
      res.json(results);
    } catch (err) {
      console.log("Error en ruta /citas:", err);
      res.status(500).json({ message: "Error retrieving vet citas from DB" });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),

  

  mascotDeletePut: asyncHandler(async (req, res,) => {
    let conn
    const mascotId = req.body.MASCOT_ID
    const mascotNewEstado = req.body.ESTADO

    try {
      conn = await oracledb.getConnection(config)
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

  mascotUpdatePut: asyncHandler(async (req, res,) => {
    let conn
    const id = req.body.MASCOT_ID
    const mascotName = req.body.NAME;
    const mascotAge = req.body.AGE;
    const mascotWeight = parseFloat(req.body.WEIGHT);

    try {
      conn = await oracledb.getConnection(config)

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

  mascotAddPost: asyncHandler(async (req, res,) => {
    let conn
    try {
      conn = await oracledb.getConnection(config);
      
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

  medHistoryList: asyncHandler(async (req, res,) => {
    let conn

    const id = req.params.id

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

  addMedHistory: asyncHandler(async (req, res) => {
    let conn
    const mascot = req.body.ID_MASCOTA;
    const diagnostico = req.body.ID_DIAGNOSTICO;
    const tratamiento = req.body.ID_TRATAMIENTO
    const descripcion = req.body.DESCRIPCION
    const usuario = req.body.ID_USUARIO

    try {
      conn = await oracledb.getConnection(config);
      
      const result = await conn.execute(
            `BEGIN AddPadecimiento(:p_id_mascota, :p_id_diagnostico, :p_id_tratamiento, :p_descripcion, :p_id_usuario, 
              :p_error); END;`,
            {
              p_id_mascota:{dir: oracledb.BIND_IN, val: mascot},
              p_id_diagnostico:{dir: oracledb.BIND_IN, val: diagnostico},
              p_id_tratamiento:{dir: oracledb.BIND_IN, val: tratamiento},
              p_descripcion:{dir: oracledb.BIND_IN, val: descripcion},
              p_id_usuario:{dir: oracledb.BIND_IN, val: usuario},
              p_error: {dir:oracledb.BIND_OUT, type: oracledb.STRING, maxSize:200}
            }
        )

      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error)
      }

      res.status(201).json({ message: "Padecimiento creado exitosamente" }); 
      
    } catch (err) {
      console.error("Error creando padecimiento:", err);
      res.status(500).json({ error: "Error creando padecimiento" });
    } finally {
      if (conn) {
          await conn.close();
      }
    }
  }),

  editMedHistory: asyncHandler(async (req, res) => {
    let conn
    const mascot = req.body.ID_MASCOTA;
    const diagnostico = req.body.ID_DIAGNOSTICO;
    const tratamiento = req.body.ID_TRATAMIENTO
    const descripcion = req.body.DESCRIPCION
    const fecha = req.body.FECHA
    const hora = req.body.HORA

    try {
      conn = await oracledb.getConnection(config);
      
      const result = await conn.execute(
            `BEGIN UpdatePadecimiento(:p_id_mascota, :p_id_diagnostico, :p_id_tratamiento, :p_descripcion, 
              :p_fecha, :p_hora, :p_error); END;`,
            {
              p_id_mascota:{dir: oracledb.BIND_IN, val: mascot},
              p_id_diagnostico:{dir: oracledb.BIND_IN, val: diagnostico},
              p_id_tratamiento:{dir: oracledb.BIND_IN, val: tratamiento},
              p_descripcion:{dir: oracledb.BIND_IN, val: descripcion},
              p_fecha:{dir: oracledb.BIND_IN, val: fecha},
              p_hora:{dir: oracledb.BIND_IN, val: hora},
              p_error: {dir:oracledb.BIND_OUT, type: oracledb.STRING, maxSize:200}
            }
        )

      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error)
      }

      res.status(201).json({ message: "Padecimiento editado exitosamente" }); 
      
    } catch (err) {
      console.error("Error creando padecimiento:", err);
      res.status(500).json({ error: "Error editando padecimiento" });
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

  clientAvailableList: asyncHandler(async (req, res,) => {
    let conn
    try {
        console.log("estoy en clientAvailableList")
        conn = await oracledb.getConnection(config)

        const result = await conn.execute(
          `BEGIN SelectAvailableClientes(:p_cursorAvailableClients, :p_error); END;`,
          {
            p_cursorAvailableClients:{dir: oracledb.BIND_OUT, type:oracledb.CURSOR},
            p_error: {dir:oracledb.BIND_OUT, type: oracledb.STRING, maxSize:200}
          }
        )
        
        if (result.outBinds.p_error != null) {
          throw new Error(result.outBinds.p_error)
        }
        // Get the result set from the REF CURSOR
        const resultSet = result.outBinds.p_cursorAvailableClients; 
        const clients = await resultSet.getRows();
        res.json(clients); 
    } catch (err) {
      console.log(err)
      console.log(err)
        res.status(500).json({ message: "Failed to get available clients" }); 
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



  // Update appointment status
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

  mascotList: asyncHandler(async (req, res,) => {
    let conn
    try {
      conn = await oracledb.getConnection(config) 
      const result = await conn.execute(
        `BEGIN 
           SelectAllMascotas(:p_error, :p_SelectAllMascotasCursor); 
         END;`,
        {
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          p_SelectAllMascotasCursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } 
        }
      );
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error)
      }
      // Get the result set from the REF CURSOR
      const resultSet = result.outBinds.p_SelectAllMascotasCursor; 
      const mascots = await resultSet.getRows();
      res.json(mascots); 
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: "Error retrieving mascots from DB" });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),

  // Function to retrieve all cita_servicios associated with a given cita_id
  getCitaServicios: asyncHandler(async (req, res) => {
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
      console.log('recibi el citaServicios:');
      console.log(result.rows);
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


  CitasServiciosList: asyncHandler(async (req, res) => {
    let conn;
    const id = req.params.citaId
    //console.log("Voy a buscar servicios de :" + id)
    //console.log(id)

    try {
      // Establish a connection to the database using the configuration settings
      conn = await oracledb.getConnection(config);

      const result = await conn.execute(
        `BEGIN 
          GETSERVICIOSFROMCITA(:p_idCita, :p_error, :p_SelectServicesCitaCursor);
        END;`,
        { 
          // Bind output parameters for the stored procedure
          p_idCita:{dir: oracledb.BIND_IN, val: id},
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          p_SelectServicesCitaCursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );

      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error); // Throw an error if `p_error` is not null
      }

      // Retrieve the result set from the REF CURSOR
      const resultSet = result.outBinds.p_SelectServicesCitaCursor;
      //console.log("los servicios que recibi son: " + resultSet)
      const results = await resultSet.getRows(); // Fetch all rows from the cursor
      //console.log("los servicios que recibi son: " + results)
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
}
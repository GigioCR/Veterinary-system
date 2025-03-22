const asyncHandler = require("express-async-handler");
const oracledb = require('oracledb')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/dbConfig');
const { sendConfirmCita, sendModifiedCita, sendCancelledCita } = require('../services/emailService');

module.exports = {
  viewAdminProfile: asyncHandler(async (req, res) => {
    let conn;
    const id = req.params.id

    try {
      // Establish a connection to the database using the configuration settings
      conn = await oracledb.getConnection(config);

      const result = await conn.execute(
        `BEGIN 
          SelectAdminProfile(:p_idAdmin, :p_error, :p_SelectAdminProfileCursor);
        END;`,
        { 
          // Bind output parameters for the stored procedure
          p_idAdmin:{dir: oracledb.BIND_IN, val: id},
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          p_SelectAdminProfileCursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );

      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error); // Throw an error if `p_error` is not null
      }

      // Retrieve the result set from the REF CURSOR in `p_SelectAdminProfileCursor`
      const resultSet = result.outBinds.p_SelectAdminProfileCursor;
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

  updateAdminProfile: asyncHandler(async (req, res) => {
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
          UpdateAdminProfile(:p_idAdmin, :p_nombre, :p_apellido, :p_correo, :p_error); 
        END;`,
        {
          // Bind input parameters
          p_idAdmin: { dir: oracledb.BIND_IN, val: id },
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

  updateAdminPassword: asyncHandler(async (req, res) => {
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
          UpdatePassword(:p_idAdmin, :p_contrasena, :p_error); 
        END;`,
        {
          // Bind input parameters
          p_idAdmin: { dir: oracledb.BIND_IN, val: id },
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

  /**
   * Retrieves administrative statistics from the database.
   * 
   * This function calls a stored procedure `SelectAdminStats` to retrieve
   * a set of administrative statistics via a REF CURSOR. The stored procedure
   * outputs any potential error in `p_error` and the results in `p_SelectAdminStatsCursor`.
   *
   * @route GET /admin/stats
   * @access Private (Admins only)
   */
  adminStats: asyncHandler(async (req, res) => {
    let conn;

    try {
      // Establish a connection to the database using the configuration settings
      conn = await oracledb.getConnection(config);

      // Execute the stored procedure `SelectAdminStats` to retrieve admin statistics
      const result = await conn.execute(
        `BEGIN 
          SelectAdminStats(:p_error, :p_SelectAdminStatsCursor);
        END;`,
        { 
          // Bind output parameters for the stored procedure
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          p_SelectAdminStatsCursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );

      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error); // Throw an error if `p_error` is not null
      }

      // Retrieve the result set from the REF CURSOR in `p_SelectAdminStatsCursor`
      const resultSet = result.outBinds.p_SelectAdminStatsCursor;
      const results = await resultSet.getRows(); // Fetch all rows from the cursor

      // Send the retrieved results as a JSON response
      res.json(results);

    } catch (err) {
      // Log the error in Spanish to indicate an issue during retrieval
      console.log("Error al obtener estadísticas administrativas en la ruta /:", err);
      // Send a 500 response with a relevant error message in Spanish
      res.status(500).json({ message: "Error al obtener estadísticas administrativas desde la base de datos" });
    } finally {
      // Ensure the database connection is closed to free up resources
      if (conn) {
        await conn.close();
      }
    }
  }),

  /**
   * Retrieves calendar data for the admin dashboard.
   * 
   * This function calls a stored procedure `SelectAdminCalendar` to retrieve calendar data 
   * through a REF CURSOR. The stored procedure outputs any potential error in `p_error`
   * and the results in `p_SelectAdminCalendarCursor`.
   *
   * @route GET /admin/calendario
   * @access Private (Admins only)
   */
  adminCalendar: asyncHandler(async (req, res) => {
    let conn;

    try {
      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);

      // Execute the stored procedure `SelectAdminCalendar` to retrieve calendar data
      const result = await conn.execute(
        `BEGIN 
          SelectAdminCalendar(:p_error, :p_SelectAdminCalendarCursor);
        END;`,
        { 
          // Bind output parameters for error handling and result set
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          p_SelectAdminCalendarCursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );

      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error); // Throw an error if `p_error` is not null
      }

      // Retrieve the result set from the REF CURSOR in `p_SelectAdminCalendarCursor`
      const resultSet = result.outBinds.p_SelectAdminCalendarCursor;
      const results = await resultSet.getRows(); // Fetch all rows from the cursor

      // Send the retrieved results as a JSON response
      res.json(results);

    } catch (err) {
      console.log("Error en ruta /calendario:", err);
      // Send a 500 response with a relevant error message
      res.status(500).json({ message: "Error al obtener el calendario administrativo desde la base de datos" });
    } finally {
      // Ensure the database connection is closed to free up resources
      if (conn) {
        await conn.close();
      }
    }
  }),

  /**
   * Retrieves the list of services from the database.
   * 
   * This function calls a stored procedure `SelectAllServices` to retrieve
   * all available services via a REF CURSOR. The stored procedure outputs
   * any potential error in `p_error` and the results in `p_SelectAllServicesCursor`.
   *
   * @route GET /admin/servicios
   * @access Private (Admins only)
   */
  serviceList: asyncHandler(async (req, res) => {
    let conn;

    try {
      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);

      // Execute the stored procedure `SelectAllServices` to retrieve all services
      const result = await conn.execute(
        `BEGIN 
          SelectAllServices(:p_error, :p_SelectAllServicesCursor);
        END;`,
        { 
          // Bind output parameters for error handling and result set
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          p_SelectAllServicesCursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );

      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error); // Throw an error if `p_error` is not null
      }

      // Retrieve the result set from the REF CURSOR in `p_SelectAllServicesCursor`
      const resultSet = result.outBinds.p_SelectAllServicesCursor;
      const services = await resultSet.getRows(); // Fetch all rows from the cursor

      // Send the retrieved services as a JSON response
      res.json(services);

    } catch (err) {
      // Log the error encountered during the service retrieval
      console.log("Error en ruta /servicios:", err);
      // Send a 500 response with an error message
      res.status(500).json({ message: "Error al obtener servicios desde la base de datos" });
    } finally {
      // Ensure the database connection is closed to free up resources
      if (conn) {
        await conn.close();
      }
    }
  }),

  // FOR DISPLAYING ALL THE SERVICES IN CITAS
  serviceListForCitas: asyncHandler(async (req, res) => {
    let conn;
  
    try {
      conn = await oracledb.getConnection(config);
  
      const result = await conn.execute(
        `BEGIN 
          SelectAllServices(:p_error, :p_SelectAllServicesCursor);
        END;`,
        { 
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          p_SelectAllServicesCursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );
  
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error);
      }
  
      const resultSet = result.outBinds.p_SelectAllServicesCursor;
      const rows = await resultSet.getRows();
      const metaData = resultSet.metaData;
      const columnNames = metaData.map(col => col.name.toUpperCase()); // Ensure consistency
  
      const services = rows.map(row => {
        let obj = {};
        for (let i = 0; i < columnNames.length; i++) {
          obj[columnNames[i]] = row[i];
        }
        return obj;
      });

      console.log(services)
  
      res.json(services);
  
    } catch (err) {
      console.log("Error en ruta /servicios:", err);
      res.status(500).json({ message: "Error al obtener servicios desde la base de datos" });
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

  /**
   * Creates a new service in the database.
   * 
   * This function calls the stored procedure `AddServicio` to insert a new service 
   * record with the specified name, type, description, and price. If an error occurs,
   * it is returned via the `p_error` output parameter.
   *
   * @route POST /admin/servicios
   * @access Private (Admins only)
   */
  serviceCreatePost: asyncHandler(async (req, res) => {
    let conn;
    
    // Extract service details from the request body
    const nombre = req.body.NOMBRE;
    const tipo = req.body.TIPO;
    const tratamiento = req.body.TRATAMIENTO;
    const descripcion = req.body.DESCRIPCION;
    const precio = req.body.PRECIO;

    try {
      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);
      
      // Execute the stored procedure `AddServicio` to add a new service
      const result = await conn.execute(
        `BEGIN 
          AddServicio(:p_nombre, :p_tipo, :p_descripcion, :p_precio, :p_tratamiento, :p_error); 
        END;`,
        {
          // Bind input parameters for the new service details
          p_nombre: { dir: oracledb.BIND_IN, val: nombre },
          p_tipo: { dir: oracledb.BIND_IN, val: tipo },
          p_descripcion: { dir: oracledb.BIND_IN, val: descripcion },
          p_precio: { dir: oracledb.BIND_IN, val: precio },
          p_tratamiento: { dir: oracledb.BIND_IN, val: tratamiento },
          // Bind output parameter to capture any error messages from the procedure
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
        }
      );

      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error); // Throw an error if `p_error` is not null
      }

      // Send a success response indicating the service was created
      res.status(201).json({ message: "Servicio creado exitosamente" });

    } catch (err) {
      // Log the error encountered during service creation
      console.error("Error creando servicio:", err);
      // Send a 500 response with a relevant error message
      res.status(500).json({ error: "Error creando servicio" });
    } finally {
      // Ensure the database connection is closed to free up resources
      if (conn) {
        await conn.close();
      }
    }
  }),

  /**
   * Toggles the active state of a service in the database.
   * 
   * This function calls the stored procedure `ChangeServiceState` to update the
   * status of a service based on the provided service ID and new state.
   * If an error occurs, it is returned via the `p_error` output parameter.
   *
   * @route PUT /admin/servicios/estado/:id
   * @access Private (Admins only)
   */
  serviceToggleState: asyncHandler(async (req, res) => {
    let conn;

    // Extract service ID and new state from the request body
    const id = req.body.id;
    const estado = req.body.estado;

    try {
      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);

      // Execute the stored procedure `ChangeServiceState` to toggle the service state
      const result = await conn.execute(
        `BEGIN 
          ChangeServiceState(:p_idServicio, :p_nuevoEstado, :p_error); 
        END;`, 
        {
          // Bind input parameters for the service ID and the new state
          p_idServicio: { dir: oracledb.BIND_IN, val: id },
          p_nuevoEstado: { dir: oracledb.BIND_IN, val: estado },
          // Bind output parameter to capture any error messages from the procedure
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
        }
      );

      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error); // Throw an error if `p_error` is not null
      }

      // Send a success response indicating the state change was successful
      res.status(200).json({ message: "Estado del servicio actualizado exitosamente" }); 

    } catch (err) {
      // Log any error encountered during the state toggle
      console.error("Error al cambiar el estado del servicio:", err);
      // Send a 500 response with a relevant error message
      res.status(500).json({ message: "Error al cambiar el estado del servicio" });
    } finally {
      // Ensure the database connection is closed to free up resources
      if (conn) {
        await conn.close();
      }
    }
  }),

  /**
   * Updates an existing service in the database.
   * 
   * This function calls the stored procedure `UpdateServicio` to update an existing
   * service record with new details such as name, type, description, and price.
   * If an error occurs, it is returned via the `p_error` output parameter.
   *
   * @route PUT /admin/servicios
   * @access Private (Admins only)
   */
  serviceUpdatePost: asyncHandler(async (req, res) => {
    let conn;

    // Extract service details from the request body
    const id = req.body.ID_SERVICIO;
    const nombre_servicio = req.body.NOMBRE;
    const tipo = req.body.TIPO;
    const descripcion = req.body.DESCRIPCION;
    const precio = req.body.PRECIO;

    try {
      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);

      // Execute the stored procedure `UpdateServicio` to update service details
      const result = await conn.execute(
        `BEGIN 
          UpdateServicio(:p_idServicio, :p_nombre, :p_tipo, :p_descripcion, :p_precio, :p_error); 
        END;`,
        {
          // Bind input parameters for the updated service details
          p_idServicio: { dir: oracledb.BIND_IN, val: id },
          p_nombre: { dir: oracledb.BIND_IN, val: nombre_servicio },
          p_tipo: { dir: oracledb.BIND_IN, val: tipo },
          p_descripcion: { dir: oracledb.BIND_IN, val: descripcion },
          p_precio: { dir: oracledb.BIND_IN, val: precio },
          // Bind output parameter to capture any error messages from the procedure
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
        }
      );
      
      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error); // Throw an error if `p_error` is not null
      }

      // Send a success response indicating the service update was successful
      res.status(200).json({ message: "Servicio actualizado exitosamente" });

    } catch (err) {
      // Log the error encountered during the service update
      console.error("Error actualizando el servicio:", err);
      // Send a 500 response with a relevant error message
      res.status(500).json({ message: "Error actualizando el servicio" });
    } finally {
      // Ensure the database connection is closed to free up resources
      if (conn) {
        await conn.close();
      }
    }
  }),

  /**
   * Retrieves the list of all clients from the database.
   * 
   * This function calls a stored procedure `SelectAllClients` to retrieve
   * all client records via a REF CURSOR. The stored procedure outputs any
   * potential error in `p_error` and the results in `p_SelectAllClientsCursor`.
   *
   * @route GET /admin/clientes
   * @access Private (Admins only)
   */
  clientList: asyncHandler(async (req, res) => {
    let conn;

    try {
      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);

      // Execute the stored procedure `SelectAllClients` to retrieve all clients
      const result = await conn.execute(
        `BEGIN 
          SelectAllClients(:p_error, :p_SelectAllClientsCursor);
        END;`,
        { 
          // Bind output parameters for error handling and result set
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          p_SelectAllClientsCursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );

      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error); // Throw an error if `p_error` is not null
      }

      // Retrieve the result set from the REF CURSOR in `p_SelectAllClientsCursor`
      const resultSet = result.outBinds.p_SelectAllClientsCursor;
      const clients = await resultSet.getRows(); // Fetch all rows from the cursor

      // Send the retrieved clients as a JSON response
      res.json(clients);

    } catch (err) {
      // Log the error encountered during client retrieval
      console.log("Error en ruta /clientes:", err);
      // Send a 500 response with an error message in Spanish
      res.status(500).json({ message: "Error al obtener clientes desde la base de datos" });
    } finally {
      // Ensure the database connection is closed to free up resources
      if (conn) {
        await conn.close();
      }
    }
  }),

  /**
   * Soft deletes (or toggles the state of) a client in the database.
   * 
   * This function calls the stored procedure `DeleteClient` to update the 
   * status of a client, effectively marking them as deleted or inactive.
   * If an error occurs, it is returned via the `p_error` output parameter.
   *
   * @route PUT /admin/clientes/delete
   * @access Private (Admins only)
   */
  clientDeletePut: asyncHandler(async (req, res) => {
    // Extract client ID and new state from the request body
    const clientId = req.body.USER_ID;
    const clientNewEstado = req.body.ESTADO;
    
    // Log information for debugging purposes
    console.log("El ID de cliente a actualizar estado es:", clientId);
    console.log("El nuevo estado para el cliente es:", clientNewEstado);

    let conn;

    try {
      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);

      // Execute the stored procedure `DeleteClient` to toggle client state
      const result = await conn.execute(
        `BEGIN 
          DeleteClient(:p_idUsuario, :p_nuevoEstado, :p_error); 
        END;`, 
        {
          // Bind input parameters for the client ID and new state
          p_idUsuario: { dir: oracledb.BIND_IN, val: clientId },
          p_nuevoEstado: { dir: oracledb.BIND_IN, val: clientNewEstado },
          // Bind output parameter to capture any error messages from the procedure
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
        }
      );

      // Commit the transaction to apply changes
      await conn.commit();

      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error); // Throw an error if `p_error` is not null
      }

      // Log successful deletion for auditing purposes
      console.log("Cliente eliminado de la base de datos");
      // Send a success response indicating the client was deleted
      res.status(200).json({ message: "Cliente eliminado exitosamente" });

    } catch (err) {
      // Log any error encountered during client deletion
      console.log("Error al eliminar cliente:", err);
      // Send a 500 response with an error message in Spanish
      res.status(500).json({ message: "Error al eliminar cliente" });
    } finally {
      // Ensure the database connection is closed to free up resources
      if (conn) {
        await conn.close();
      }
    }
  }),

  /**
   * Updates client information in the database.
   * 
   * This function calls the stored procedure `UpdateCliente` to modify an existing
   * client record with updated details, including the client’s name, surname, email, 
   * and address. If an error occurs, it is returned via the `p_error` output parameter.
   *
   * @route PUT /admin/clientes/update/:id
   * @access Private (Admins only)
   */
  clientUpdatePut: asyncHandler(async (req, res) => {
    let conn;

    // Extract client ID from URL parameters and updated client details from the request body
    const id = req.params.id;
    const first_name = req.body.NOMBRE;
    const last_name = req.body.APELLIDO;
    const correo = req.body.CORREO;
    const direccion = req.body.DIRECCION;

    try {
      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);

      // Execute the stored procedure `UpdateCliente` to update client details
      const result = await conn.execute(
        `BEGIN 
          UpdateCliente(:p_idUsuario, :p_nombre, :p_apellido, :p_correo, :p_direccion, :p_error); 
        END;`,
        {
          // Bind input parameters for the updated client details
          p_idUsuario: { dir: oracledb.BIND_IN, val: id },
          p_nombre: { dir: oracledb.BIND_IN, val: first_name },
          p_apellido: { dir: oracledb.BIND_IN, val: last_name },
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

      // Commit the transaction to apply changes
      await conn.commit();

      // Send a success response indicating the client update was successful
      res.status(200).json({ message: "Cliente actualizado exitosamente" });

    } catch (err) {
      // Log the error encountered during client update
      console.error("Error al actualizar cliente:", err);
      // Send a 500 response with an error message in Spanish
      res.status(500).json({ message: "Error al actualizar el cliente" });
    } finally {
      // Ensure the database connection is closed to free up resources
      if (conn) {
        await conn.close();
      }
    }
  }),

  /**
   * Retrieves the list of available clients from the database.
   * 
   * This function calls the stored procedure `SelectAvailableClientes` to fetch
   * a list of clients who are currently available. The procedure outputs any
   * potential error in `p_error` and the results in `p_cursorAvailableClients`.
   *
   * @route GET /admin/availableClients
   * @access Private (Admins only)
   */
  clientAvailableList: asyncHandler(async (req, res) => {
    let conn;

    try {
      console.log("Fetching available clients...");

      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);

      // Execute the stored procedure `SelectAvailableClientes` to fetch available clients
      const result = await conn.execute(
        `BEGIN 
          SelectAvailableClientes(:p_cursorAvailableClients, :p_error); 
        END;`,
        {
          // Bind output parameters for error handling and result set
          p_cursorAvailableClients: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
        }
      );

      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error); // Throw an error if `p_error` is not null
      }

      // Retrieve the result set from the REF CURSOR in `p_cursorAvailableClients`
      const resultSet = result.outBinds.p_cursorAvailableClients;
      const clients = await resultSet.getRows(); // Fetch all rows from the cursor

      // Send the retrieved available clients as a JSON response
      res.json(clients);

    } catch (err) {
      // Log the error encountered during available client retrieval
      console.log("Error al obtener clientes disponibles:", err);
      // Send a 500 response with an error message in Spanish
      res.status(500).json({ message: "Error al obtener clientes disponibles" });
    } finally {
      // Ensure the database connection is closed to free up resources
      if (conn) {
        await conn.close();
      }
    }
  }),

  /**
   * Adds a new client to the database.
   * 
   * This function first checks if a user with the specified `ID_USUARIO` already exists by
   * calling the stored procedure `UserExists`. If no existing user is found, it then proceeds
   * to add the client using the `AddCliente` procedure, which includes hashing the provided
   * password and storing it securely in the database.
   *
   * @route POST /admin/clientes/add
   * @access Private (Admins only)
   */
  clientAddPost: asyncHandler(async (req, res) => {
    let conn;

    // Extract client details from the request body
    const first_name = req.body.NOMBRE;
    const last_name = req.body.APELLIDO;
    const ID_USUARIO = req.body.ID_USUARIO;
    const email = req.body.CORREO;
    const address = req.body.DIRECCION;
    const password = req.body.CONTRASENA;

    try {
      // Hash the client's password before storing it in the database
      const hashedPassword = await bcrypt.hash(password, 10);

      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);

      // Check if the user already exists in the database
      const result = await conn.execute(
        `BEGIN 
          UserExists(:p_idUsuario, :p_error, :p_cursorUserExists); 
        END;`,
        {
          p_idUsuario: { dir: oracledb.BIND_IN, val: ID_USUARIO },
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          p_cursorUserExists: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );

      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error); // Throw an error if `p_error` is not null
      }

      // Retrieve the result set to determine if the user already exists
      const resultSet = result.outBinds.p_cursorUserExists;
      const countRow = await resultSet.getRow();
      const userExists = countRow[0] > 0;

      if (!userExists) {
        console.log("La dirección del cliente a agregar es:", address);

        // Add the new client to the database using the `AddCliente` stored procedure
        await conn.execute(
          `BEGIN 
            AddCliente(:p_idUsuario, :p_nombre, :p_apellido, :p_correo, :p_contrasena, :p_direccion, :p_error); 
          END;`,
          {
            p_idUsuario: { dir: oracledb.BIND_IN, val: ID_USUARIO },
            p_nombre: { dir: oracledb.BIND_IN, val: first_name },
            p_apellido: { dir: oracledb.BIND_IN, val: last_name },
            p_correo: { dir: oracledb.BIND_IN, val: email },
            p_contrasena: { dir: oracledb.BIND_IN, val: hashedPassword },
            p_direccion: { dir: oracledb.BIND_IN, val: address },
            p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
          }
        );

        // Commit the transaction to apply changes
        await conn.commit();

        // Send a success response indicating the client creation was successful
        res.status(201).json({ message: "Cliente creado exitosamente" });
        // TODO[VAL] - If creating a new client, maybe send out an email?
      } else {
        console.error("Ya existe un cliente con ese nombre de usuario");
        // Send a response indicating that the client already exists
        res.json({ exists: true });
      }

    } catch (err) {
      // Log the error encountered during client creation
      console.error("Error creando cliente:", err);
      // Send a 500 response with an error message in Spanish
      res.status(500).json({ error: "Error creando cliente" });
    } finally {
      // Ensure the database connection is closed to free up resources
      if (conn) {
        await conn.close();
      }
    }
  }),

  /**
   * Retrieves a list of veterinarians from the database.
   * 
   * This function calls the stored procedure `AdminFetchVeterinarios` to fetch a list
   * of veterinarians. The procedure outputs the list of veterinarians via a cursor,
   * which is then mapped into a structured JSON response.
   *
   * @route GET /admin/veterinarios
   * @access Private (Admins only)
   */
  veterinarioList: asyncHandler(async (req, res) => {
    let conn;

    try {
      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);
    
      // Execute the stored procedure `AdminFetchVeterinarios` to fetch veterinarian list
      const result = await conn.execute(
        `BEGIN
          ADMIN.AdminFetchVeterinarios(:p_veterinarios, :p_error);
        END;`,
        {
          // Bind output parameters for error handling and result set
          p_veterinarios: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
        }
      );
    
      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error); // Throw an error if `p_error` is not null
      }
    
      // Fetch all rows from the cursor `p_veterinarios`
      const resultSet = await result.outBinds.p_veterinarios.getRows();
    
      // Map the result set to an array of objects with structured field names
      const veterinarios = resultSet.map(row => ({
        ID_USUARIO: row[0],       // Veterinarian's user ID
        NOMBRE: row[1],           // First name
        APELLIDO: row[2],         // Last name
        CORREO: row[3],           // Email
        SALARIO: row[4],          // Salary
        ESPECIALIDAD: row[5],     // Specialty
        ESTADO: row[6]            // Status (active/inactive)
      }));
    
      // Log the formatted veterinarians array for verification
      console.log("Veterinarios:", veterinarios);
    
      // Send the formatted JSON response with the veterinarians list
      res.json(veterinarios);
    
    } catch (err) {
      // Log the error and send a response with a relevant error message
      console.log("Error al obtener lista de veterinarios:", err);
      res.status(500).json({ error: "Error al obtener lista de veterinarios" });
    } finally {
      // Ensure the database connection is closed to free up resources
      if (conn) { 
        await conn.close();
      }
    }
  }),

  /**
   * Checks if a veterinarian with the specified ID exists in the database. Is called when a new
   * veterinarian is created.
   * 
   * This function calls the stored procedure `AdminCheckUserExists` to verify if a
   * veterinarian with the given `userId` exists. If a unique constraint violation occurs,
   * it catches the error and responds appropriately.
   *
   * @route GET /admin/veterinarios/:id
   * @access Private (Admins only)
   */
  veterinarioVerificarSiEstaba: asyncHandler(async (req, res) => {
    const userId = req.params.id; // Veterinarian user ID to verify
    let conn;

    try {
      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);
    
      // Execute the procedure to check if the user exists
      const result = await conn.execute(
        `BEGIN
            ADMIN.AdminCheckUserExists(:p_userId, :p_exists, :p_error);
        END;`,
        {
          p_userId: { dir: oracledb.BIND_IN, val: userId },
          p_exists: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
        }
      );
    
      // Check for errors returned by the stored procedure
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error);
      }
    
      // Determine if the user exists based on the output parameter
      const exists = result.outBinds.p_exists === 1;
      console.log(exists ? "vea que siesta" : "nope, no estaba"); // Log existence check result
    
      // Send the existence result in JSON format
      res.json({ exists });
    
    } catch (err) {
      // Handle unique constraint violation for duplicate veterinarian IDs
      if (err.message.includes("ORA-00001")) {
        console.error("Error: ID de veterinario ya existe:", err);
        res.status(409).json({ error: "El ID de veterinario ya existe" });
      } else {
        // Log any other errors and send a 500 response with a general error message
        console.error("Error al verificar el ID de usuario", err);
        res.status(500).json({ error: "Error al verificar el ID de usuario" });
      }
    } finally {
      // Ensure the database connection is closed to free up resources
      if (conn) {
        await conn.close();
      }
    }    
  }),

  /**
   * Adds a new veterinarian to the database.
   * 
   * This function calls the stored procedure `AdminAddVeterinario` to create a new veterinarian
   * with the provided details. If the veterinarian ID already exists, it catches the unique 
   * constraint violation error and responds appropriately.
   *
   * @route POST /admin/veterinarios
   * @access Private (Admins only)
   */
  veterinarioCreatePost: asyncHandler(async(req, res) => {
    console.log("Attempting to create a new veterinarian...");
    let conn;

    try {
      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);
    
      // Destructure request body parameters
      const { id_usuario, nombre, apellido, correo, contrasena, salario, especialidad } = req.body;
    
      // Execute the stored procedure `AdminAddVeterinario` to insert veterinarian details
      const result = await conn.execute(
        `BEGIN
          ADMIN.AdminAddVeterinario(
            :p_id_usuario, :p_nombre, :p_apellido, :p_correo, :p_contrasena, 
            :p_rol, :p_salario, :p_especialidad, :p_error
          );
        END;`,
        {
          p_id_usuario: { dir: oracledb.BIND_IN, val: id_usuario }, // Veterinarian ID
          p_nombre: { dir: oracledb.BIND_IN, val: nombre },         // First name
          p_apellido: { dir: oracledb.BIND_IN, val: apellido },     // Last name
          p_correo: { dir: oracledb.BIND_IN, val: correo },         // Email address
          p_contrasena: { dir: oracledb.BIND_IN, val: contrasena }, // Password
          p_rol: { dir: oracledb.BIND_IN, val: 'veterinario' },     // Role set to 'veterinario'
          p_salario: { dir: oracledb.BIND_IN, val: salario },       // Salary
          p_especialidad: { dir: oracledb.BIND_IN, val: especialidad }, // Specialty
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 } // Error output
        }
      );
    
      // Check if the stored procedure returned an error
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error); // Throw an error if `p_error` is not null
      }
    
      // If successful, send a response indicating the veterinarian was added
      res.status(201).json("Veterinario agregado exitosamente!");
    
    } catch (err) {
      // Handle unique constraint violation (duplicate veterinarian ID) with appropriate message
      if (err.message.includes("ORA-00001")) {
        console.error("Error: ID de veterinario ya existe:", err);
        res.status(409).json({ error: "El ID de veterinario ya existe" });
      } else {
        // Log and respond with a general error message for any other errors
        console.error("Error creando al veterinario", err);
        res.status(500).json({ error: "Error creando al veterinario" });
      }
    } finally {
      // Ensure the database connection is closed
      if (conn) {
        await conn.close();
      }
    }
  }),

  /**
   * Hard deletes a veterinarian by their user ID.
   * 
   * This function calls the stored procedure `AdminDeleteUsuarioVet` to delete a veterinarian
   * with the specified `vetId`. If the veterinarian is found and successfully deleted, it returns
   * a success message. Otherwise, it responds with a "not found" message.
   *
   * @route DELETE /admin/veterinarios/:id
   * @access Private (Admins only)
   */
  veterinarioDeletePost: asyncHandler(async (req, res) => {
    const vetId = req.params.id; // ID of the veterinarian to delete
    let conn;
    
    try {
      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);
    
      // Execute the stored procedure `AdminDeleteUsuarioVet` to delete the veterinarian
      const result = await conn.execute(
        `BEGIN
            ADMIN.AdminDeleteUsuarioVet(:p_id_usuario, :p_rows_affected, :p_error);
        END;`,
        {
          p_id_usuario: { dir: oracledb.BIND_IN, val: vetId },             // Veterinarian ID
          p_rows_affected: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }, // Rows affected
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 } // Error output
        }
      );
    
      // Check for errors returned by the stored procedure
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error);
      }
    
      // Check if any rows were affected (i.e., user was deleted)
      if (result.outBinds.p_rows_affected > 0) {
        res.status(200).json({ message: "Usuario eliminado exitosamente!" });
      } else {
        res.status(404).json({ message: "Usuario no encontrado." });
      }
    
    } catch (err) {
      // Log the error and send a 500 response with a relevant message
      console.error("Error eliminando al usuario", err);
      res.status(500).json({ error: "Error eliminando al usuario" });
    } finally {
      // Ensure the database connection is closed to free up resources
      if (conn) {
        await conn.close();
      }
    } 
  }),

  veterinarioToggleEstado: asyncHandler(async (req, res) => {
    const vetId = req.params.id;
    const { estado } = req.body;
    let conn;
  
    try {
      conn = await oracledb.getConnection(config);
    
      // Execute the procedure
      const result = await conn.execute(
        `BEGIN
            ADMIN.AdminUpdateUsuarioEstado(:p_id_usuario, :p_estado, :p_rows_affected, :p_error);
        END;`,
        {
          p_id_usuario: { dir: oracledb.BIND_IN, val: vetId },
          p_estado: { dir: oracledb.BIND_IN, val: estado },
          p_rows_affected: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
        }
      );
    
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error);
      }
    
      // Check if any rows were affected
      if (result.outBinds.p_rows_affected > 0) {
        res.status(200).json({ message: 'Estado actualizado exitosamente!' });
      } else {
        res.status(404).json({ message: 'Veterinario no encontrado.' });
      }
    
    } catch (err) {
      console.error('Error actualizando el estado del veterinario', err);
      res.status(500).json({ error: err.message });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),


  veterinarioUpdatePut: asyncHandler(async (req, res) => {
    const vetId = req.params.id;
    let conn;
  
    try {
      conn = await oracledb.getConnection(config);
    
      const { nombre, apellido, correo, rol, salario, especialidad } = req.body;
    
      // Execute the procedure
      const result = await conn.execute(
        `BEGIN
            ADMIN.AdminUpdateVeterinario(:p_id_usuario, :p_nombre, :p_apellido, :p_correo, :p_rol, :p_salario, :p_especialidad, :p_rows_affected, :p_error);
        END;`,
        {
          p_id_usuario: { dir: oracledb.BIND_IN, val: vetId },
          p_nombre: { dir: oracledb.BIND_IN, val: nombre },
          p_apellido: { dir: oracledb.BIND_IN, val: apellido },
          p_correo: { dir: oracledb.BIND_IN, val: correo },
          p_rol: { dir: oracledb.BIND_IN, val: rol },
          p_salario: { dir: oracledb.BIND_IN, val: salario },
          p_especialidad: { dir: oracledb.BIND_IN, val: especialidad },
          p_rows_affected: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
        }
      );
    
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error);
      }
    
      // Check if any rows were affected
      if (result.outBinds.p_rows_affected > 0) {
        res.status(200).json({ message: "Usuario actualizado exitosamente!" });
      } else {
        res.status(404).json({ message: "Usuario no encontrado." });
      }
    
    } catch (err) {
      console.error('Error actualizando al usuario', err);
      res.status(500).json({ error: "Error actualizando al usuario" });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),

  clientActivosList: asyncHandler(async (req, res) => {
    let conn;
    try {
      conn = await oracledb.getConnection(config);
    
      console.log("Executing AdminFetchActiveClients procedure...");
    
      const result = await conn.execute(
        `BEGIN
            ADMIN.AdminFetchActiveClients(:p_active_clients, :p_error);
        END;`,
        {
          p_active_clients: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
        }
      );
    
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error);
      }
    
      console.log("Procedure executed successfully, fetching cursor rows...");
    
      // Fetch rows from the cursor
      const resultSet = await result.outBinds.p_active_clients.getRows();
    
      // Format the result set to an array of objects
      const formattedResult = resultSet.map(row => ({
        ID_USUARIO: row[0],
        NOMBRE: row[1],
        APELLIDO: row[2]
      }));
    
      console.log("Formatted result set:", formattedResult);
      res.json(formattedResult);
    
    } catch (err) {
      console.error("Error fetching active client IDs:", err);
      res.status(500).json({ error: "Error fetching active client IDs" });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),

  // Fetch active veterinarians
  veterinariosActivosList: asyncHandler(async (req, res) => {
    let conn;
    try {
      conn = await oracledb.getConnection(config);
    
      console.log("Executing AdminFetchActiveVeterinarians procedure...");
    
      const result = await conn.execute(
        `BEGIN
            ADMIN.AdminFetchActiveVeterinarians(:p_active_veterinarians, :p_error);
        END;`,
        {
          p_active_veterinarians: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
        }
      );
    
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error);
      }
    
      console.log("Procedure executed successfully, fetching cursor rows...");
    
      // Fetch rows from the cursor
      const resultSet = await result.outBinds.p_active_veterinarians.getRows();
    
      // Format the result set to an array of objects
      const formattedResult = resultSet.map(row => ({
        ID_USUARIO: row[0],
        NOMBRE: row[1],
        APELLIDO: row[2]
      }));
    
      console.log("Formatted result set:", formattedResult);
      res.json(formattedResult);
    
    } catch (err) {
      console.error("Error fetching veterinarians:", err);
      res.status(500).json({ error: "Error fetching veterinarians" });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),

  getMascotasActivasByCliente: asyncHandler(async (req, res) => {
    const id_usuario_cli = req.params.id_usuario_cli;
    let conn;
    try {
      conn = await oracledb.getConnection(config);
    
      console.log("Executing AdminFetchActiveMascotas procedure...");
    
      const result = await conn.execute(
        `BEGIN
            ADMIN.AdminFetchActiveMascotas(:p_id_usuario_cli, :p_active_mascotas, :p_error);
        END;`,
        {
          p_id_usuario_cli: { dir: oracledb.BIND_IN, val: id_usuario_cli },
          p_active_mascotas: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
        }
      );
    
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error);
      }
    
      console.log("Procedure executed successfully, fetching cursor rows...");
    
      // Fetch rows from the cursor
      const resultSet = await result.outBinds.p_active_mascotas.getRows();
    
      // Format the result set to an array of objects
      const formattedResult = resultSet.map(row => ({
        ID_MASCOTA: row[0],
        NOMBRE: row[1],
        ESPECIE: row[2]
      }));
    
      console.log("Formatted result set:", formattedResult);
      res.json(formattedResult);
    
    } catch (err) {
      console.error("Error fetching mascotas:", err);
      res.status(500).json({ error: "Error fetching mascotas" });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),

  tipoCitasActivosList: asyncHandler(async (req, res) => {
    let conn;
    try {
      conn = await oracledb.getConnection(config);
    
      console.log("Executing AdminFetchActiveTiposCita procedure...");
    
      const result = await conn.execute(
        `BEGIN
            ADMIN.AdminFetchActiveTiposCita(:p_active_tipos_cita, :p_error);
        END;`,
        {
          p_active_tipos_cita: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
        }
      );
    
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error);
      }
    
      console.log("Procedure executed successfully, fetching cursor rows...");
    
      // Fetch rows from the cursor
      const resultSet = await result.outBinds.p_active_tipos_cita.getRows();
    
      // Format the result set to an array of objects
      const formattedResult = resultSet.map(row => ({
        ID_TIPO: row[0],
        NOMBRE: row[1]
      }));
    
      console.log("Formatted result set:", formattedResult);
      res.json(formattedResult);
    
    } catch (err) {
      console.error("Error fetching tipos de cita:", err);
      res.status(500).json({ error: "Error fetching tipos de cita" });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),

  // Citas CRUD operations
  citaList: asyncHandler(async (req, res) => {
    let conn;
    try {
      conn = await oracledb.getConnection(config);
    
      console.log("Executing AdminFetchCitasList procedure...");
    
      const result = await conn.execute(
        `BEGIN
            ADMIN.AdminFetchCitasList(:p_citas_list, :p_error);
        END;`,
        {
          p_citas_list: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
        }
      );
    
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error);
      }
    
      console.log("Procedure executed successfully, fetching cursor rows...");
    
      // Fetch rows from the cursor
      const resultSet = await result.outBinds.p_citas_list.getRows();

      // Format the result set to an array of objects with meaningful keys
      const formattedResult = resultSet.map(row => ({
        ID_CITA: row[0],
        ID_MASCOTA: row[1],
        ID_USUARIO_CLI: row[2],
        ID_USUARIO_VET: row[3],
        FECHA: row[4],
        HORA: row[5],
        ESTADO: row[6],
        ESPECIE: row[7],
        CLIENTE: row[8],
        VETERINARIO: row[9],
        TIPO_CITA_NOMBRE: row[10]
      }));

      console.log("AdminFetchCitasList result set:", formattedResult);    
      res.json(formattedResult);
    
    } catch (err) {
      console.error("Error fetching citas", err);
      res.status(500).json({ error: "Error fetching citas" });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }),

  citaCreate: asyncHandler(async (req, res) => {
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
      // Establish a connection to the Oracle database
      conn = await oracledb.getConnection(config);
  
      // Prepare the bind variables, including the new output parameter
      const bindVars = {
        p_id_mascota: { dir: oracledb.BIND_IN, val: id_mascota },
        p_id_usuario_cli: { dir: oracledb.BIND_IN, val: id_usuario_cli },
        p_fecha: { dir: oracledb.BIND_IN, val: new Date(fecha) },
        p_tipo_cita: { dir: oracledb.BIND_IN, val: tipo_cita },
        p_id_usuario_vet: { dir: oracledb.BIND_IN, val: id_usuario_vet },
        p_new_cita_id: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 }, // Match your working code
        p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
      };
  
      // Execute the EL_BIGOTE.CreateCita stored procedure
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
  
      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error);
      }
  
      // Return the new cita ID to the client
      res.status(201).json({
        message: "Cita creada exitosamente",
        citaId: result.outBinds.p_new_cita_id,
      });
    } catch (err) {
      // Log the error encountered during cita creation
      console.error("Error creating cita:", err);
      res.status(500).json({
        message: "Error creating cita in the database",
        error: err.message,
      });
    } finally {
      // Ensure the database connection is closed to free up resources
      if (conn) {
        await conn.close();
      }
    }
  }),
  
    
  citaToggleEstado: asyncHandler(async (req, res) => {
    let conn;
    const id_cita = req.params.id;
    const { estado } = req.body;

    try {
        conn = await oracledb.getConnection(config);

        console.log("Executing AdminToggleCitaEstadoWithDetails procedure...");

        const result = await conn.execute(
            `BEGIN
                ADMIN.AdminToggleCitaEstadoWithDetails(
                    :p_id_cita,
                    :p_estado,
                    :p_client_name,
                    :p_client_email,
                    :p_pet_name,
                    :p_appointment_type,
                    :p_appointment_date,
                    :p_original_estado,
                    :p_rows_affected,
                    :p_error
                );
            END;`,
            {
                p_id_cita: { dir: oracledb.BIND_IN, val: id_cita },
                p_estado: { dir: oracledb.BIND_IN, val: estado },
                p_client_name: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 },
                p_client_email: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
                p_pet_name: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 },
                p_appointment_type: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
                p_appointment_date: { dir: oracledb.BIND_OUT, type: oracledb.DATE },
                p_original_estado: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                p_rows_affected: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
            }
          );

          // Handle procedure error
          if (result.outBinds.p_error) {
              throw new Error(result.outBinds.p_error);
          }

          // Check rows affected
          if (result.outBinds.p_rows_affected === 0) {
              return res.status(404).json({ message: "Cita no encontrada" });
          }

          // Send cancellation email if status changed to "deshabilitado"
          if (result.outBinds.p_original_estado === 1 && estado === 0) {
              const clientName = result.outBinds.p_client_name;
              const clientEmail = result.outBinds.p_client_email;
              const petName = result.outBinds.p_pet_name;
              const appointmentType = result.outBinds.p_appointment_type;
              const appointmentDate = new Date(result.outBinds.p_appointment_date).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
              });
              const appointmentTime = new Date(result.outBinds.p_appointment_date).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
              });

              console.log("Sending cancellation email...");
              await sendCancelledCita(clientEmail, clientName, appointmentDate, appointmentTime, appointmentType, petName);
              console.log("Cancellation email sent successfully.");
          }

          res.status(200).json({ message: "Estado de cita actualizado exitosamente" });
      } catch (err) {
          console.error("Error actualizando estado de cita:", err);
          res.status(500).json({ error: "Error actualizando estado de cita" });
      } finally {
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

        const result1 = await conn.execute(
          `BEGIN
              ADMIN.AdminToggleCitaEstadoWithDetails(
                  :p_id_cita,
                  :p_estado,
                  :p_client_name,
                  :p_client_email,
                  :p_pet_name,
                  :p_appointment_type,
                  :p_appointment_date,
                  :p_original_estado,
                  :p_rows_affected,
                  :p_error
              );
          END;`,
          {
              p_id_cita: { dir: oracledb.BIND_IN, val: id_cita },
              p_estado: { dir: oracledb.BIND_IN, val: estado },
              p_client_name: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 },
              p_client_email: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
              p_pet_name: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 },
              p_appointment_type: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
              p_appointment_date: { dir: oracledb.BIND_OUT, type: oracledb.DATE },
              p_original_estado: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
              p_rows_affected: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
              p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          }
        );

        const result2 = await conn.execute(
          `BEGIN 
            EL_BIGOTE.UpdateCitaEstado(:p_idCita, :p_estado, :p_error);
          END;`,
          {
            p_idCita: { dir: oracledb.BIND_IN, val: citaId },
            p_estado: { dir: oracledb.BIND_IN, val: estado },
            p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          }
        );
      
        if (result2.outBinds.p_error != null) {
          throw new Error(result2.outBinds.p_error);
        }

        // Send cancellation email if status changed to "deshabilitado"
        if (estado === 0) {
          const clientName = result.outBinds.p_client_name;
          const clientEmail = result.outBinds.p_client_email;
          const petName = result.outBinds.p_pet_name;
          const appointmentType = result.outBinds.p_appointment_type;
          const appointmentDate = new Date(result.outBinds.p_appointment_date).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
          });
          const appointmentTime = new Date(result.outBinds.p_appointment_date).toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
          });

          console.log("Sending cancellation email...");
          await sendCancelledCita(clientEmail, clientName, appointmentDate, appointmentTime, appointmentType, petName);
          console.log("Cancellation email sent successfully.");
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
    
  
    updateCita: asyncHandler(async (req, res) => {
      console.log('--- Entering updateCita Controller ---');
      let conn;
      const citaId = req.params.citaId; // Ensure this matches your route parameter
      console.log('Received citaId:', citaId);
      const { fecha } = req.body; // Expecting 'fecha' in 'YYYY-MM-DD HH24:MI' format
      console.log('Received fecha:', fecha);
    
      if (!citaId || !fecha) {
        console.log('Missing citaId or fecha');
        return res.status(400).json({ message: "Cita ID and new fecha are required" });
      }
    
      try {
        conn = await oracledb.getConnection(config);
        console.log("Connected to OracleDB");
    
        // Prepare the SQL UPDATE statement
        const updateQuery = `
          UPDATE citas
          SET fecha = TO_DATE(:fecha, 'YYYY-MM-DD HH24:MI')
          WHERE id_cita = :citaId
        `;
    
        console.log("Executing SQL UPDATE statement...");
    
        // Execute the UPDATE statement
        const result = await conn.execute(
          updateQuery,
          {
            fecha: fecha,
            citaId: citaId
          },
          {
            autoCommit: true // Automatically commit the transaction
          }
        );
    
        console.log("SQL UPDATE Result:", result);
    
        // Check how many rows were affected
        const rowsAffected = result.rowsAffected;
        console.log("Rows Affected:", rowsAffected);
    
        if (rowsAffected > 0) {
          console.log("Cita updated successfully");
          res.status(200).json({ message: "Fecha de cita actualizada exitosamente" });
        } else {
          console.log("Cita not found");
          res.status(404).json({ message: "Cita no encontrada" });
        }
      } catch (err) {
        console.error("Error actualizando fecha de cita:", err.message);
        res.status(500).json({ error: "Error actualizando fecha de cita" });
      } finally {
        if (conn) {
          try {
            await conn.close();
            console.log("OracleDB connection closed");
          } catch (closeErr) {
            console.error("Error closing OracleDB connection:", closeErr);
          }
        }
        console.log('--- Exiting updateCita Controller ---');
      }
    }),
  
  
    availableTimes: asyncHandler(async (req, res) => {
      const { date, vetId, clientId, petId } = req.query; // Added clientId and petId to the query parameters
      let conn;
    
      try {
        conn = await oracledb.getConnection(config);
    
        // Execute the stored procedure
        const result = await conn.execute(
            `BEGIN
                ADMIN.AdminFetchBookedHours(:p_date_value, :p_vet_id_value, :p_client_id_value, :p_pet_id_value, :p_booked_hours, :p_error);
            END;`,
            {
                p_date_value: { dir: oracledb.BIND_IN, val: date },
                p_vet_id_value: { dir: oracledb.BIND_IN, val: vetId },
                p_client_id_value: { dir: oracledb.BIND_IN, val: clientId },
                p_pet_id_value: { dir: oracledb.BIND_IN, val: petId },
                p_booked_hours: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
                p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
            }
        );
    
        // Check for errors in the procedure
        if (result.outBinds.p_error != null) {
            throw new Error(result.outBinds.p_error);
        }
    
        // Process the cursor to retrieve booked hours
        const bookedHoursRows = [];
        const resultSet = result.outBinds.p_booked_hours;
    
        if (resultSet) {
            let row;
            while ((row = await resultSet.getRow())) {
                console.log("Fetched Row:", row);  // Log each row retrieved
                if (row[0]) {  // Access the first element directly as it's an array
                    const formattedHour = row[0].padStart(2, '0') + ":00";
                    bookedHoursRows.push(formattedHour);
                }
            }
            await resultSet.close();
        } else {
            console.error("Cursor resultSet is not defined.");
        }
    
        console.log("Booked Hours:", bookedHoursRows);
    
        // Generate all possible hours from "08:00" to "21:00"
        const allHours = Array.from({ length: 14 }, (_, i) => `${(8 + i).toString().padStart(2, '0')}:00`);
        console.log("All Hours:", allHours);
    
        // Filter out booked hours from all possible hours
        const availableHours = allHours.filter(hour => !bookedHoursRows.includes(hour));
        console.log("Available Hours:", availableHours);
    
        // Return available hours as JSON response
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

  mascotList: asyncHandler(async (req, res,) => {
    let conn;
    try {
      console.log("Estoy en mascotList")
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

  mascotUpdatePut: asyncHandler(async (req, res,) => {
    const id = req.body.MASCOT_ID
    const mascotName = req.body.NAME;
    const mascotAge = req.body.AGE;
    const mascotWeight = parseFloat(req.body.WEIGHT);

    try {
        let conn = await oracledb.getConnection(config);

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
    try {
        let conn = await oracledb.getConnection(config);
        
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

  PagosList: asyncHandler(async (req, res) => {
    let conn;

    try {
      // Establish a connection to the database using the configuration settings
      conn = await oracledb.getConnection(config);

      const result = await conn.execute(
        `BEGIN 
          SelectAllPayments(:p_error, :p_SelectAllPaymentsCursor);
        END;`,
        { 
          // Bind output parameters for the stored procedure
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          p_SelectAllPaymentsCursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );

      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error); // Throw an error if `p_error` is not null
      }

      // Retrieve the result set from the REF CURSOR
      const resultSet = result.outBinds.p_SelectAllPaymentsCursor;
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

    try {
      // Establish a connection to the database using the configuration settings
      let conn = await oracledb.getConnection(config);

      const result = await conn.execute(
        `BEGIN 
          SelectCitasServices(:p_error, :p_SelectCitasServicesCursor);
        END;`,
        { 
          // Bind output parameters for the stored procedure
          p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          p_SelectCitasServicesCursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );

      // Check if the stored procedure returned an error message
      if (result.outBinds.p_error != null) {
        throw new Error(result.outBinds.p_error); // Throw an error if `p_error` is not null
      }

      // Retrieve the result set from the REF CURSOR
      const resultSet = result.outBinds.p_SelectCitasServicesCursor;
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
}

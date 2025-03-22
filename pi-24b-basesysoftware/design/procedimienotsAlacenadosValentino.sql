DESCRIBE EL_BIGOTE.USUARIOS;
DESCRIBE EL_BIGOTE.USUARIOS_CLIENTES;
DESCRIBE EL_BIGOTE.USUARIOS_VETERINARIOS;
DESCRIBE EL_BIGOTE.USUARIOS_ADMINISTRADORES;

CREATE OR REPLACE PROCEDURE AuthInsertClient(
    p_idUsuario IN VARCHAR2,
    p_nombre IN VARCHAR2,
    p_apellido IN VARCHAR2,
    p_correo IN VARCHAR2,
    p_contrasena IN VARCHAR2,
    p_dir IN VARCHAR2,
    p_emailExists OUT NUMBER,
    p_error OUT VARCHAR2
) AS
BEGIN
    -- Check if email or ID already exists
    SELECT COUNT(*)
    INTO p_emailExists
    FROM EL_BIGOTE.USUARIOS
    WHERE CORREO = p_correo OR ID_USUARIO = p_idUsuario;

    IF p_emailExists > 0 THEN
        -- Skip insertion and raise an error
        p_error := 'Correo o ID de usuario ya están registrados';
        RETURN;
    END IF;

    -- Insert into USUARIOS table
    INSERT INTO EL_BIGOTE.USUARIOS (ID_USUARIO, NOMBRE, APELLIDO, CORREO, CONTRASENA, ROL)
    VALUES (p_idUsuario, p_nombre, p_apellido, p_correo, p_contrasena, 'cliente');

    -- Insert into USUARIOS_CLIENTES table
    INSERT INTO EL_BIGOTE.USUARIOS_CLIENTES (ID_USUARIO, DIRECCION)
    VALUES (p_idUsuario, p_dir);

    -- Commit the transaction
    COMMIT;

    -- Clear error if everything succeeds
    p_error := NULL;

EXCEPTION
    WHEN OTHERS THEN
        -- Capture the exact error message
        p_error := 'Error ingresando al cliente: ' || SQLERRM;
        -- Rollback the transaction
        ROLLBACK;
END AuthInsertClient;
/

-- Grant permission to execute the procedure
GRANT EXECUTE ON AuthInsertClient TO PUBLIC;

CREATE OR REPLACE PROCEDURE AdminGetEmailDetails(
    p_tipo_cita IN EL_BIGOTE.TIPO_CITAS.ID_TIPO%TYPE,
    p_id_mascota IN EL_BIGOTE.MASCOTAS.ID_MASCOTA%TYPE,
    p_id_usuario_cli IN EL_BIGOTE.USUARIOS.ID_USUARIO%TYPE,
    p_clientName OUT EL_BIGOTE.USUARIOS.NOMBRE%TYPE,
    p_clientEmail OUT EL_BIGOTE.USUARIOS.CORREO%TYPE,
    p_petName OUT EL_BIGOTE.MASCOTAS.NOMBRE%TYPE,
    p_appointmentType OUT EL_BIGOTE.TIPO_CITAS.NOMBRE%TYPE,
    p_error OUT VARCHAR2
) AS
BEGIN
    -- Initialize output parameters
    p_error := NULL;
    
    -- Fetch client name, email, and pet name
    BEGIN
        SELECT 
            u.NOMBRE, 
            u.CORREO, 
            m.NOMBRE
        INTO 
            p_clientName, 
            p_clientEmail, 
            p_petName
        FROM 
            EL_BIGOTE.USUARIOS u
        JOIN 
            EL_BIGOTE.MASCOTAS m ON m.ID_USUARIO_CLI = u.ID_USUARIO
        WHERE 
            u.ID_USUARIO = p_id_usuario_cli
        AND 
            m.ID_MASCOTA = p_id_mascota;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_error := 'No matching client or pet found for the given inputs';
            RETURN;
        WHEN OTHERS THEN
            p_error := SQLERRM;
            RETURN;
    END;

    -- Fetch appointment type separately using a subquery
    BEGIN
        SELECT 
            tc.NOMBRE
        INTO 
            p_appointmentType
        FROM 
            EL_BIGOTE.TIPO_CITAS tc
        WHERE 
            tc.ID_TIPO = p_tipo_cita;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_error := 'Appointment type not found for the given ID';
        WHEN OTHERS THEN
            p_error := SQLERRM;
    END;
END;
/

-- Grant execute permissions
GRANT EXECUTE ON AdminGetEmailDetails TO PUBLIC;

CREATE OR REPLACE PROCEDURE AdminGetModifiedCitaDetails(
    p_id_cita IN EL_BIGOTE.CITAS.ID_CITA%TYPE,
    p_clientName OUT EL_BIGOTE.USUARIOS.NOMBRE%TYPE,
    p_clientEmail OUT EL_BIGOTE.USUARIOS.CORREO%TYPE,
    p_petName OUT EL_BIGOTE.MASCOTAS.NOMBRE%TYPE,
    p_appointmentType OUT EL_BIGOTE.TIPO_CITAS.NOMBRE%TYPE,
    p_originalDate OUT DATE,
    p_error OUT VARCHAR2
) AS
BEGIN
    -- Initialize output parameters
    p_error := NULL;
    
    BEGIN
        SELECT 
            u.NOMBRE AS clientName, 
            u.CORREO AS clientEmail, 
            m.NOMBRE AS petName, 
            (SELECT tc.NOMBRE 
             FROM EL_BIGOTE.TIPO_CITAS tc 
             WHERE tc.ID_TIPO = c.TIPO_CITA) AS appointmentType,
            c.FECHA AS originalDate
        INTO 
            p_clientName, 
            p_clientEmail, 
            p_petName, 
            p_appointmentType, 
            p_originalDate
        FROM 
            EL_BIGOTE.CITAS c
        JOIN 
            EL_BIGOTE.USUARIOS u ON u.ID_USUARIO = c.ID_USUARIO_CLI
        JOIN 
            EL_BIGOTE.MASCOTAS m ON m.ID_MASCOTA = c.ID_MASCOTA
        WHERE 
            c.ID_CITA = p_id_cita;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_error := 'No details found for the given appointment ID';
        WHEN OTHERS THEN
            p_error := SQLERRM;
    END;
END;
/

-- Grant execute permissions
GRANT EXECUTE ON AdminGetModifiedCitaDetails TO PUBLIC;

CREATE OR REPLACE PROCEDURE AuthCheckUserType (
    p_username IN EL_BIGOTE.USUARIOS.ID_USUARIO%TYPE,
    p_userType OUT VARCHAR2,
    p_redirectRoute OUT VARCHAR2,
    p_userId OUT EL_BIGOTE.USUARIOS.ID_USUARIO%TYPE,
    p_nombre OUT EL_BIGOTE.USUARIOS.NOMBRE%TYPE,
    p_apellido OUT EL_BIGOTE.USUARIOS.APELLIDO%TYPE,
    p_error OUT VARCHAR2
) AS
BEGIN
    -- Check if the user is a client
    BEGIN
        SELECT 'cliente', '/clientes', U.ID_USUARIO, NOMBRE, APELLIDO 
        INTO p_userType, p_redirectRoute, p_userId, p_nombre, p_apellido
        FROM EL_BIGOTE.USUARIOS_CLIENTES UC
        JOIN EL_BIGOTE.USUARIOS U ON UC.ID_USUARIO = U.ID_USUARIO
        WHERE UC.ID_USUARIO = p_username;
        RETURN; -- Exit if found
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            NULL; -- Continue to next check
    END;

    -- Check if the user is an admin
    BEGIN
        SELECT 'administrador', '/administradores', U.ID_USUARIO, NOMBRE, APELLIDO 
        INTO p_userType, p_redirectRoute, p_userId, p_nombre, p_apellido
        FROM EL_BIGOTE.USUARIOS_ADMINISTRADORES UA
        JOIN EL_BIGOTE.USUARIOS U ON UA.ID_USUARIO = U.ID_USUARIO
        WHERE UA.ID_USUARIO = p_username;
        RETURN; -- Exit if found
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            NULL; -- Continue to next check
    END;

    -- Check if the user is a veterinarian
    BEGIN
        SELECT 'veterinario', '/veterinarios', U.ID_USUARIO, NOMBRE, APELLIDO 
        INTO p_userType, p_redirectRoute, p_userId, p_nombre, p_apellido
        FROM EL_BIGOTE.USUARIOS_VETERINARIOS UV
        JOIN EL_BIGOTE.USUARIOS U ON UV.ID_USUARIO = U.ID_USUARIO
        WHERE UV.ID_USUARIO = p_username;
        RETURN; -- Exit if found
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            NULL; -- No user type found
    END;

    -- If no user type found, set outputs to null or an error message
    p_userType := NULL;
    p_redirectRoute := NULL;
    p_userId := NULL;
    p_nombre := NULL;
    p_apellido := NULL;

EXCEPTION
    WHEN OTHERS THEN
        p_error := SQLERRM;
        ROLLBACK;
END;
/
-- Or, grant permission to all users (public)
GRANT EXECUTE ON AuthCheckUserType TO PUBLIC;

CREATE OR REPLACE PROCEDURE AdminFetchVeterinarios (
    p_veterinarios OUT SYS_REFCURSOR,
    p_error OUT VARCHAR2
) AS
BEGIN
    OPEN p_veterinarios FOR
        SELECT u.ID_USUARIO, u.NOMBRE, u.APELLIDO, u.CORREO, uv.SALARIO, uv.ESPECIALIDAD, u.ESTADO
        FROM EL_BIGOTE.USUARIOS u
        JOIN EL_BIGOTE.USUARIOS_VETERINARIOS uv ON u.ID_USUARIO = uv.ID_USUARIO;

EXCEPTION
    WHEN OTHERS THEN
        p_error := SQLERRM;
        IF p_veterinarios%ISOPEN THEN
            CLOSE p_veterinarios;
        END IF;
        ROLLBACK;
END;
/
GRANT EXECUTE ON AdminFetchVeterinarios TO PUBLIC;


CREATE OR REPLACE PROCEDURE AdminCheckUserExists (
    p_userId IN EL_BIGOTE.USUARIOS.ID_USUARIO%TYPE,
    p_exists OUT NUMBER,
    p_error OUT VARCHAR2
) AS
BEGIN
    -- Check if the user exists
    SELECT COUNT(*)
    INTO p_exists
    FROM EL_BIGOTE.USUARIOS
    WHERE ID_USUARIO = p_userId;

    -- Convert the count to a binary result
    IF p_exists > 0 THEN
        p_exists := 1; -- User exists
    ELSE
        p_exists := 0; -- User does not exist
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        p_error := SQLERRM;
        p_exists := NULL;
END;
/
GRANT EXECUTE ON AdminCheckUserExists TO PUBLIC;


CREATE OR REPLACE PROCEDURE AdminAddVeterinario (
    p_id_usuario IN EL_BIGOTE.USUARIOS.ID_USUARIO%TYPE,
    p_nombre IN EL_BIGOTE.USUARIOS.NOMBRE%TYPE,
    p_apellido IN EL_BIGOTE.USUARIOS.APELLIDO%TYPE,
    p_correo IN EL_BIGOTE.USUARIOS.CORREO%TYPE,
    p_contrasena IN EL_BIGOTE.USUARIOS.CONTRASENA%TYPE,
    p_rol IN EL_BIGOTE.USUARIOS.ROL%TYPE,
    p_salario IN EL_BIGOTE.USUARIOS_VETERINARIOS.SALARIO%TYPE,
    p_especialidad IN EL_BIGOTE.USUARIOS_VETERINARIOS.ESPECIALIDAD%TYPE,
    p_error OUT VARCHAR2
) AS
BEGIN
    -- Insert into USUARIOS table
    INSERT INTO EL_BIGOTE.USUARIOS (ID_USUARIO, NOMBRE, APELLIDO, CORREO, CONTRASENA, ROL)
    VALUES (p_id_usuario, p_nombre, p_apellido, p_correo, p_contrasena, p_rol);

    -- Insert into USUARIOS_VETERINARIOS table
    INSERT INTO EL_BIGOTE.USUARIOS_VETERINARIOS (ID_USUARIO, SALARIO, ESPECIALIDAD)
    VALUES (p_id_usuario, p_salario, p_especialidad);

    -- Commit the transaction
    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        p_error := SQLERRM;
        ROLLBACK;
END;
/
GRANT EXECUTE ON AdminAddVeterinario TO PUBLIC;


CREATE OR REPLACE PROCEDURE AdminDeleteUsuarioVet (
    p_id_usuario IN EL_BIGOTE.USUARIOS.ID_USUARIO%TYPE,
    p_rows_affected OUT NUMBER,
    p_error OUT VARCHAR2
) AS
BEGIN
    -- First, try to delete from the USUARIOS_VETERINARIOS table
    DELETE FROM EL_BIGOTE.USUARIOS_VETERINARIOS
    WHERE ID_USUARIO = p_id_usuario;

    -- Delete from the USUARIOS table
    DELETE FROM EL_BIGOTE.USUARIOS
    WHERE ID_USUARIO = p_id_usuario;

    -- Check if rows were deleted from USUARIOS
    IF SQL%ROWCOUNT > 0 THEN
        p_rows_affected := SQL%ROWCOUNT;
    ELSE
        p_rows_affected := 0;
    END IF;

    -- Commit the transaction
    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        p_error := SQLERRM;
        ROLLBACK;
END;
/
GRANT EXECUTE ON AdminDeleteUsuarioVet TO PUBLIC



CREATE OR REPLACE PROCEDURE AdminUpdateUsuarioEstado (
    p_id_usuario IN EL_BIGOTE.USUARIOS.ID_USUARIO%TYPE,
    p_estado IN EL_BIGOTE.USUARIOS.ESTADO%TYPE,
    p_rows_affected OUT NUMBER,
    p_error OUT VARCHAR2
) AS
BEGIN
    -- Update the estado in the USUARIOS table
    UPDATE EL_BIGOTE.USUARIOS
    SET ESTADO = p_estado
    WHERE ID_USUARIO = p_id_usuario;

    -- Set the number of rows affected
    p_rows_affected := SQL%ROWCOUNT;

    -- Commit the transaction
    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        p_error := SQLERRM;
        ROLLBACK;
END;
/
GRANT EXECUTE ON AdminUpdateUsuarioEstado TO PUBLIC


CREATE OR REPLACE PROCEDURE AdminUpdateVeterinario (
    p_id_usuario IN EL_BIGOTE.USUARIOS.ID_USUARIO%TYPE,
    p_nombre IN EL_BIGOTE.USUARIOS.NOMBRE%TYPE,
    p_apellido IN EL_BIGOTE.USUARIOS.APELLIDO%TYPE,
    p_correo IN EL_BIGOTE.USUARIOS.CORREO%TYPE,
    p_rol IN EL_BIGOTE.USUARIOS.ROL%TYPE,
    p_salario IN EL_BIGOTE.USUARIOS_VETERINARIOS.SALARIO%TYPE,
    p_especialidad IN EL_BIGOTE.USUARIOS_VETERINARIOS.ESPECIALIDAD%TYPE,
    p_rows_affected OUT NUMBER,
    p_error OUT VARCHAR2
) AS
    v_rows_affected_usuarios NUMBER := 0;
    v_rows_affected_veterinarios NUMBER := 0;
BEGIN
    -- Update the USUARIOS_VETERINARIOS table
    UPDATE EL_BIGOTE.USUARIOS_VETERINARIOS
    SET SALARIO = p_salario,
        ESPECIALIDAD = p_especialidad
    WHERE ID_USUARIO = p_id_usuario;
    v_rows_affected_veterinarios := SQL%ROWCOUNT;

    -- Update the USUARIOS table
    UPDATE EL_BIGOTE.USUARIOS
    SET NOMBRE = p_nombre,
        APELLIDO = p_apellido,
        CORREO = p_correo,
        ROL = p_rol
    WHERE ID_USUARIO = p_id_usuario;
    v_rows_affected_usuarios := SQL%ROWCOUNT;

    -- Sum the rows affected from both tables
    p_rows_affected := v_rows_affected_usuarios + v_rows_affected_veterinarios;

    -- Commit the transaction
    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        p_error := SQLERRM;
        ROLLBACK;
END;
/
GRANT EXECUTE ON AdminUpdateVeterinario TO PUBLIC

CREATE OR REPLACE PROCEDURE AdminFetchActiveClients (
    p_active_clients OUT SYS_REFCURSOR,
    p_error OUT VARCHAR2
) AS
BEGIN
    -- Open a cursor to fetch active client data
    OPEN p_active_clients FOR
        SELECT u.ID_USUARIO AS ID_USUARIO, 
               u.NOMBRE AS NOMBRE, 
               u.APELLIDO AS APELLIDO
        FROM EL_BIGOTE.USUARIOS u
        JOIN EL_BIGOTE.USUARIOS_CLIENTES uc 
            ON LOWER(u.ID_USUARIO) = LOWER(uc.ID_USUARIO)
        WHERE u.ESTADO = 1;

EXCEPTION
    WHEN OTHERS THEN
        p_error := SQLERRM;
        IF p_active_clients%ISOPEN THEN
            CLOSE p_active_clients;
        END IF;
        ROLLBACK;
END;
/
GRANT EXECUTE ON AdminFetchActiveClients TO PUBLIC


CREATE OR REPLACE PROCEDURE AdminFetchActiveVeterinarians (
    p_active_veterinarians OUT SYS_REFCURSOR,
    p_error OUT VARCHAR2
) AS
BEGIN
    -- Open a cursor to fetch active veterinarian data
    OPEN p_active_veterinarians FOR
        SELECT u.ID_USUARIO AS ID_USUARIO, 
               u.NOMBRE AS NOMBRE, 
               u.APELLIDO AS APELLIDO
        FROM EL_BIGOTE.USUARIOS u
        JOIN EL_BIGOTE.USUARIOS_VETERINARIOS uv 
            ON u.ID_USUARIO = uv.ID_USUARIO
        WHERE u.ESTADO = 1;

EXCEPTION
    WHEN OTHERS THEN
        p_error := SQLERRM;
        IF p_active_veterinarians%ISOPEN THEN
            CLOSE p_active_veterinarians;
        END IF;
        ROLLBACK;
END;
/
GRANT EXECUTE ON AdminFetchActiveVeterinarians TO PUBLIC

CREATE OR REPLACE PROCEDURE AdminFetchActiveMascotas (
    p_id_usuario_cli IN EL_BIGOTE.MASCOTAS.ID_USUARIO_CLI%TYPE,
    p_active_mascotas OUT SYS_REFCURSOR,
    p_error OUT VARCHAR2
) AS
BEGIN
    -- Open a cursor to fetch active pet data for a specific client
    OPEN p_active_mascotas FOR
        SELECT ID_MASCOTA AS ID_MASCOTA, 
               NOMBRE AS NOMBRE, 
               ESPECIE AS ESPECIE
        FROM EL_BIGOTE.MASCOTAS
        WHERE ID_USUARIO_CLI = p_id_usuario_cli
          AND ESTADO = 1;

EXCEPTION
    WHEN OTHERS THEN
        p_error := SQLERRM;
        IF p_active_mascotas%ISOPEN THEN
            CLOSE p_active_mascotas;
        END IF;
        ROLLBACK;
END;
/
GRANT EXECUTE ON AdminFetchActiveMascotas TO PUBLIC

CREATE OR REPLACE PROCEDURE AdminFetchActiveTiposCita (
    p_active_tipos_cita OUT SYS_REFCURSOR,
    p_error OUT VARCHAR2
) AS
BEGIN
    -- Open a cursor to fetch active types of appointments
    OPEN p_active_tipos_cita FOR
        SELECT ID_TIPO AS ID_TIPO, 
               NOMBRE AS NOMBRE
        FROM EL_BIGOTE.TIPO_CITAS
        WHERE ESTADO = 1;

EXCEPTION
    WHEN OTHERS THEN
        p_error := SQLERRM;
        IF p_active_tipos_cita%ISOPEN THEN
            CLOSE p_active_tipos_cita;
        END IF;
        ROLLBACK;
END;
/
GRANT EXECUTE ON AdminFetchActiveTiposCita TO PUBLIC

CREATE OR REPLACE PROCEDURE AdminFetchCitasList (
    p_citas_list OUT SYS_REFCURSOR,
    p_error OUT VARCHAR2
) AS
BEGIN
    -- Open a cursor to fetch the list of appointments with related information
    OPEN p_citas_list FOR
        SELECT
          c.ID_CITA,
          c.ID_MASCOTA,
          c.ID_USUARIO_CLI,
          c.ID_USUARIO_VET,
          TO_CHAR(c.FECHA, 'YYYY-MM-DD') AS FECHA,
          TO_CHAR(c.FECHA, 'HH24:MI') AS HORA,
          c.ESTADO,
          m.ESPECIE AS ESPECIE,
          u_cli.NOMBRE || ' ' || u_cli.APELLIDO AS CLIENTE,
          u_vet.NOMBRE || ' ' || u_vet.APELLIDO AS VETERINARIO,
          tc.NOMBRE AS TIPO_CITA_NOMBRE
        FROM
          EL_BIGOTE.CITAS c
          JOIN EL_BIGOTE.USUARIOS u_cli ON c.ID_USUARIO_CLI = u_cli.ID_USUARIO
          JOIN EL_BIGOTE.USUARIOS u_vet ON c.ID_USUARIO_VET = u_vet.ID_USUARIO
          JOIN EL_BIGOTE.MASCOTAS m ON c.ID_MASCOTA = m.ID_MASCOTA
          JOIN EL_BIGOTE.TIPO_CITAS tc ON c.TIPO_CITA = tc.ID_TIPO;

EXCEPTION
    WHEN OTHERS THEN
        p_error := SQLERRM;
        IF p_citas_list%ISOPEN THEN
            CLOSE p_citas_list;
        END IF;
        ROLLBACK;
END;
/
GRANT EXECUTE ON AdminFetchCitasList TO PUBLIC


CREATE OR REPLACE PROCEDURE AdminCreateCita (
    p_id_mascota IN EL_BIGOTE.CITAS.ID_MASCOTA%TYPE,
    p_id_usuario_cli IN EL_BIGOTE.CITAS.ID_USUARIO_CLI%TYPE,
    p_estado IN EL_BIGOTE.CITAS.ESTADO%TYPE,
    p_fecha IN DATE,
    p_tipo_cita IN EL_BIGOTE.CITAS.TIPO_CITA%TYPE,
    p_id_usuario_vet IN EL_BIGOTE.CITAS.ID_USUARIO_VET%TYPE,
    p_error OUT VARCHAR2
) AS
BEGIN
    -- Insert a new appointment into the CITAS table
    INSERT INTO EL_BIGOTE.CITAS (ID_MASCOTA, ID_USUARIO_CLI, ESTADO, FECHA, TIPO_CITA, ID_USUARIO_VET)
    VALUES (p_id_mascota, p_id_usuario_cli, p_estado, p_fecha, p_tipo_cita, p_id_usuario_vet);

    -- Commit the transaction
    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        p_error := SQLERRM;
        ROLLBACK;
END;
/
GRANT EXECUTE ON AdminCreateCita TO PUBLIC


CREATE OR REPLACE PROCEDURE AdminUpdateCitaEstado (
    p_id_cita IN EL_BIGOTE.CITAS.ID_CITA%TYPE,
    p_estado IN EL_BIGOTE.CITAS.ESTADO%TYPE,
    p_rows_affected OUT NUMBER,
    p_error OUT VARCHAR2
) AS
BEGIN
    -- Update the ESTADO of the specified appointment
    UPDATE EL_BIGOTE.CITAS 
    SET ESTADO = p_estado
    WHERE ID_CITA = p_id_cita;

    -- Return the number of rows affected
    p_rows_affected := SQL%ROWCOUNT;

    -- Commit the transaction
    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        p_error := SQLERRM;
        ROLLBACK;
END;
/
GRANT EXECUTE ON AdminUpdateCitaEstado TO PUBLIC

CREATE OR REPLACE PROCEDURE AdminUpdateCitaFecha (
    p_id_cita IN EL_BIGOTE.CITAS.ID_CITA%TYPE,
    p_new_fecha IN DATE,
    p_rows_affected OUT NUMBER,
    p_error OUT VARCHAR2
) AS
BEGIN
    -- Update the FECHA of the specified appointment
    UPDATE EL_BIGOTE.CITAS 
    SET FECHA = p_new_fecha
    WHERE ID_CITA = p_id_cita;

    -- Return the number of rows affected
    p_rows_affected := SQL%ROWCOUNT;

    -- Commit the transaction
    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        p_error := SQLERRM;
        ROLLBACK;
END;
/
GRANT EXECUTE ON AdminUpdateCitaFecha TO PUBLIC

CREATE OR REPLACE PROCEDURE AdminFetchBookedHours (
    p_date_value IN VARCHAR2,
    p_vet_id_value IN EL_BIGOTE.CITAS.ID_USUARIO_VET%TYPE,
    p_client_id_value IN EL_BIGOTE.CITAS.ID_USUARIO_CLI%TYPE,
    p_pet_id_value IN EL_BIGOTE.CITAS.ID_MASCOTA%TYPE,
    p_booked_hours OUT SYS_REFCURSOR,
    p_error OUT VARCHAR2
) AS
BEGIN
    OPEN p_booked_hours FOR
        SELECT TO_CHAR(FECHA, 'HH24') AS HOUR
        FROM EL_BIGOTE.CITAS
        WHERE TO_CHAR(FECHA, 'YYYY-MM-DD') = p_date_value
        AND (
            (ID_USUARIO_VET = p_vet_id_value AND ESTADO = 1)
            OR (ID_USUARIO_CLI = p_client_id_value AND ID_MASCOTA = p_pet_id_value AND ESTADO = 1)
        );

    p_error := NULL;  -- Set to NULL if no errors

EXCEPTION
    WHEN OTHERS THEN
        p_error := SQLERRM;  -- Capture error message
        IF p_booked_hours%ISOPEN THEN
            CLOSE p_booked_hours;  -- Ensure cursor is closed in case of an error
        END IF;
        ROLLBACK;
END;
/
GRANT EXECUTE ON AdminFetchBookedHours TO PUBLIC;


DECLARE
    booked_hours SYS_REFCURSOR;
    error_message VARCHAR2(200);
    v_hour VARCHAR2(5);
BEGIN
    ADMIN.AdminFetchBookedHours(
        p_date_value     => '2024-12-01',    -- Date
        p_vet_id_value   => 'paolaVet',      -- Veterinarian ID
        p_client_id_value => 'lmatagod',     -- Client ID
        p_pet_id_value    => 'MS123464',     -- Pet ID
        p_booked_hours    => booked_hours,
        p_error           => error_message
    );

IF error_message IS NOT NULL THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || error_message);
    ELSE
        DBMS_OUTPUT.PUT_LINE('Procedure executed successfully.');
        
        -- Fetch and display each hour from the cursor
        LOOP
            FETCH booked_hours INTO v_hour;
            EXIT WHEN booked_hours%NOTFOUND;
            DBMS_OUTPUT.PUT_LINE('Booked Hour: ' || v_hour);
        END LOOP;

        -- Close the cursor after processing
        CLOSE booked_hours;
    END IF;
END;
/

CREATE OR REPLACE PROCEDURE SP_GET_PAYMENT_DETAILS(
    p_payment_id IN NUMBER,
    p_mascota OUT VARCHAR2,
    p_veterinario OUT VARCHAR2,
    p_fecha_cita OUT DATE,
    p_hora_cita OUT VARCHAR2,
    p_monto_total OUT NUMBER,
    p_servicios_cursor OUT SYS_REFCURSOR,
    p_error OUT VARCHAR2
) AS
    v_id_cita VARCHAR2(20);
BEGIN
    -- Get the ID_CITA from PAGOS
    SELECT ID_CITA INTO v_id_cita FROM EL_BIGOTE.PAGOS WHERE ID_PAGO = p_payment_id;

    -- Fetch main payment details
    SELECT
        ma.NOMBRE,
        us.NOMBRE || ' ' || us.APELLIDO,
        ci.FECHA,
        TO_CHAR(ci.FECHA, 'HH24:MI'),
        pa.MONTO
    INTO
        p_mascota,
        p_veterinario,
        p_fecha_cita,
        p_hora_cita,
        p_monto_total
    FROM EL_BIGOTE.PAGOS pa
    JOIN EL_BIGOTE.CITAS ci ON pa.ID_CITA = ci.ID_CITA
    JOIN EL_BIGOTE.MASCOTAS ma ON ci.ID_MASCOTA = ma.ID_MASCOTA
    JOIN EL_BIGOTE.USUARIOS us ON ci.ID_USUARIO_VET = us.ID_USUARIO
    WHERE pa.ID_PAGO = p_payment_id;

    -- Open cursor for services
    OPEN p_servicios_cursor FOR
        SELECT
            NOMBRE_SERVICIO,
            PRECIO
        FROM EL_BIGOTE.CITA_SERVICIOS
        WHERE ID_CITA = v_id_cita;

    -- Commit transaction
    COMMIT;

    -- Clear error
    p_error := NULL;

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_error := 'No se encontró el pago con el ID proporcionado.';
        ROLLBACK;
    WHEN OTHERS THEN
        p_error := SQLERRM;
        ROLLBACK;
END SP_GET_PAYMENT_DETAILS;
/

-- Grant permission to execute the procedure
GRANT EXECUTE ON SP_GET_PAYMENT_DETAILS TO PUBLIC;

import '@testing-library/jest-dom';
import { describe, expect, test, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from "@testing-library/user-event";
import CitasPage from '../components/citas/CitasPage';
import axiosInstance from '../api/axiosInstance';

vi.mock('../api/axiosInstance');

describe('CitasPage', () => {

    afterEach(() => {
        vi.clearAllMocks();
    });

    // test('renders citas', async () => {

    //     // Mock the initial API calls
    //     // 1. fetchCitas()
    //     axiosInstance.get.mockResolvedValueOnce({
    //         data: [
    //             {
    //                 ID_CITA: 1,
    //                 CLIENTE: "John Doe",
    //                 VETERINARIO: "Dr. Smith",
    //                 FECHA: "2023-12-01",
    //                 HORA: "10:00",
    //                 ESPECIE: "Canino",
    //                 TIPO_CITA_NOMBRE: "Consulta",
    //                 ESTADO: 1
    //             }
    //         ]
    //     });

    //     // 2. fetchClientIDs()
    //     axiosInstance.get.mockResolvedValueOnce({
    //         data: [
    //             {
    //                 ID_USUARIO: 2,
    //                 NOMBRE: "John",
    //                 APELLIDO: "Doe"
    //             }
    //         ]
    //     });

    //     // 3. fetchVeterinarians()
    //     axiosInstance.get.mockResolvedValueOnce({
    //         data: [
    //             {
    //                 ID_USUARIO: 3,
    //                 NOMBRE: "Dr.",
    //                 APELLIDO: "Smith"
    //             }
    //         ]
    //     });

    //     // 4. fetchTipoCitas()
    //     axiosInstance.get.mockResolvedValueOnce({
    //         data: [
    //             {
    //                 ID_TIPO: 1,
    //                 NOMBRE: "Consulta"
    //             }
    //         ]
    //     });

    //     await act(async () => {
    //         render(
    //             <MemoryRouter initialEntries={["/administradores/citas"]}>
    //                 <Routes>
    //                     <Route path='/administradores/citas' element={<CitasPage />} />
    //                 </Routes>
    //             </MemoryRouter>
    //         );
    //     });

    //     // Now check that the data is rendered
    //     expect(screen.getByText('John Doe')).toBeInTheDocument();
    //     expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    //     expect(screen.getByText('2023-12-01')).toBeInTheDocument();
    //     expect(screen.getByText('10:00')).toBeInTheDocument();
    //     expect(screen.getByText('Canino')).toBeInTheDocument();
    //     expect(screen.getByText('Consulta')).toBeInTheDocument();
    //     expect(screen.getByText('Habilitada')).toBeInTheDocument();

    // });

    // test('disable cita', async () => {
    //     // Mock initial data
    //     // 1. fetchCitas()
    //     axiosInstance.get.mockResolvedValueOnce({
    //         data: [
    //             {
    //                 ID_CITA: 1,
    //                 CLIENTE: "John Doe",
    //                 VETERINARIO: "Dr. Smith",
    //                 FECHA: "2023-12-01",
    //                 HORA: "10:00",
    //                 ESPECIE: "Canino",
    //                 TIPO_CITA_NOMBRE: "Consulta",
    //                 ESTADO: 1
    //             }
    //         ]
    //     });

    //     // 2. fetchClientIDs()
    //     axiosInstance.get.mockResolvedValueOnce({
    //         data: [
    //             {
    //                 ID_USUARIO: 2,
    //                 NOMBRE: "John",
    //                 APELLIDO: "Doe"
    //             }
    //         ]
    //     });

    //     // 3. fetchVeterinarians()
    //     axiosInstance.get.mockResolvedValueOnce({
    //         data: [
    //             {
    //                 ID_USUARIO: 3,
    //                 NOMBRE: "Dr.",
    //                 APELLIDO: "Smith"
    //             }
    //         ]
    //     });

    //     // 4. fetchTipoCitas()
    //     axiosInstance.get.mockResolvedValueOnce({
    //         data: [
    //             {
    //                 ID_TIPO: 1,
    //                 NOMBRE: "Consulta"
    //             }
    //         ]
    //     });

    //     // Mock PUT request to change estado
    //     axiosInstance.put.mockResolvedValueOnce({
    //         data: {
    //             status: 200
    //         }
    //     });

    //     await act(async () => {
    //         render(
    //             <MemoryRouter initialEntries={["/administradores/citas"]}>
    //                 <Routes>
    //                     <Route path='/administradores/citas' element={<CitasPage />} />
    //                 </Routes>
    //             </MemoryRouter>
    //         );
    //     });

    //      // Open the menu for the first row
    //     const actionsButton = await screen.findByRole('button', { name: /Actions/i });
    //     fireEvent.click(actionsButton);

    //     // Wait for the menu to open and then find the 'Deshabilitar' menu item
    //     const disableMenuItem = await screen.findByText('Deshabilitar');
    //     fireEvent.click(disableMenuItem);

    //     // Confirm in modal
    //     const confirmButton = await screen.findByText('Deshabilitar');
    //     fireEvent.click(confirmButton);

    //     // Wait for the API call and state update
    //     await waitFor(() => {
    //         expect(axiosInstance.put).toHaveBeenCalledWith(
    //             `http://localhost:8080/administradores/citas/estado/1`,
    //             { estado: 0 }
    //         );
    //         expect(screen.getByText('Deshabilitada')).toBeInTheDocument();
    //     });

    // });

    // test('edit cita', async () => {
    //     // Mock initial data
    //     // 1. fetchCitas()
    //     axiosInstance.get.mockResolvedValueOnce({
    //         data: [
    //             {
    //                 ID_CITA: 1,
    //                 CLIENTE: "John Doe",
    //                 VETERINARIO: "Dr. Smith",
    //                 FECHA: "2023-12-01",
    //                 HORA: "10:00",
    //                 ESPECIE: "Canino",
    //                 TIPO_CITA_NOMBRE: "Consulta",
    //                 ESTADO: 1,
    //                 ID_USUARIO_VET: 3
    //             }
    //         ]
    //     });

    //     // 2. fetchClientIDs()
    //     axiosInstance.get.mockResolvedValueOnce({
    //         data: [
    //             {
    //                 ID_USUARIO: 2,
    //                 NOMBRE: "John",
    //                 APELLIDO: "Doe"
    //             }
    //         ]
    //     });

    //     // 3. fetchVeterinarians()
    //     axiosInstance.get.mockResolvedValueOnce({
    //         data: [
    //             {
    //                 ID_USUARIO: 3,
    //                 NOMBRE: "Dr.",
    //                 APELLIDO: "Smith"
    //             }
    //         ]
    //     });

    //     // 4. fetchTipoCitas()
    //     axiosInstance.get.mockResolvedValueOnce({
    //         data: [
    //             {
    //                 ID_TIPO: 1,
    //                 NOMBRE: "Consulta"
    //             }
    //         ]
    //     });

    //     // Mock fetchEditAvailableTimes()
    //     axiosInstance.get.mockResolvedValueOnce({
    //         data: ["08:00", "09:00", "10:00", "11:00"]
    //     });

    //     // Mock PUT request to update cita
    //     axiosInstance.put.mockResolvedValueOnce({
    //         data: {
    //             status: 200
    //         }
    //     });

    //     const user = userEvent.setup();

    //     await act(async () => {
    //         render(
    //             <MemoryRouter initialEntries={["/administradores/citas"]}>
    //                 <Routes>
    //                     <Route path='/administradores/citas' element={<CitasPage />} />
    //                 </Routes>
    //             </MemoryRouter>
    //         );
    //     });

    //     // Open the menu for the first row
    //     const actionsButton = await screen.findByRole('button', { name: /Actions/i });
    //     fireEvent.click(actionsButton);

    //     // Wait for the menu to open and then find the 'Editar' menu item
    //     const editMenuItem = await screen.findByText('Editar');
    //     fireEvent.click(editMenuItem);

    //     // Now the 'Editar' modal should appear

    //     // Find the date picker input
    //     const dateInput = await screen.findByLabelText('Fecha');


    //     // Open the date picker
    //     fireEvent.mouseDown(dateInput);

    //     // Select a new date (assuming date picker is displayed)
    //     // For testing purposes, we can directly set the date
    //     // Mock fetchEditAvailableTimes() for new date
    //     axiosInstance.get.mockResolvedValueOnce({
    //     data: ["08:00", "09:00", "10:00", "11:00"],
    //     });

    //     fireEvent.change(dateInput, { target: { value: '12/02/2023' } });

    //     // Simulate date selection
    //     const newDate = new Date('2023-12-02');
    //     await act(async () => {
    //         fireEvent.change(dateInput, { target: { value: '12/02/2023' } });
    //     });

    //     // Mock fetchEditAvailableTimes() again for new date
    //     axiosInstance.get.mockResolvedValueOnce({
    //         data: ["08:00", "09:00", "10:00", "11:00"]
    //     });

    //     // Find the time select
    //     const timeSelect = await screen.findByLabelText('Hora');

    //     // Open the select
    //     fireEvent.mouseDown(timeSelect);

    //     // Wait for options to appear
    //     const listbox = await screen.findByRole('listbox');
    //     const newTimeOption = await within(listbox).findByText('11:00');
    //     fireEvent.click(newTimeOption);

    //     // Now click the 'Guardar Cambios' button
    //     const saveButton = await screen.findByText('Guardar Cambios');
    //     fireEvent.click(saveButton);
    //     // Wait for the API call
    //     await waitFor(() => {
    //         expect(axiosInstance.put).toHaveBeenCalledWith(
    //             `http://localhost:8080/administradores/citas/1`,
    //             {
    //                 new_fecha: '2023-12-02 11:00'
    //             }
    //         );
    //     });

    //     // Wait for the success message
    //     await waitFor(() => {
    //         expect(screen.getByText('Se guardaron los cambios exitosamente.')).toBeInTheDocument();
    //     });

    // });

    

});

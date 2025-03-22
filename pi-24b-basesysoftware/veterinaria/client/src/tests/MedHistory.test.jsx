import { describe, expect, test, it, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import VetMascotsPage from '../components/vet/mascots/VetMascotsPage';
import MedHistory from '../components/vet/mascots/MedHistory';
import axiosInstance from '../api/axiosInstance';


vi.mock('../api/axiosInstance')
// vi.mock('react-router-dom')

describe('renders medical history page', () => {

  // beforeEach(() => {
  //   useLocation.mockReturnValueOnce({ 
  //     USER_ID: "lmatagod",
  //     NOMBRE_CLIENTE: "Luis",
  //     APELLIDO_CLIENTE: "Mata",
  //     ID_MASCOTA: "MS123",
  //     NOMBRE_MASCOTA: "Vash",
  //     DUEÑO: "Luis mata",
  //     SPECIES: "Perro",
  //     BREED: "Golden Retriever",
  //     WEIGHT: 18,
  //     AGE: 4,
  //     ESTADO: 1
  //   });
  // });

    test('view medical history', async() => {

      axiosInstance.get.mockResolvedValueOnce({
        data: [
          [ "lmatagod", "Luis", "Mata", "MS123", "Vash", "Perro", "Golden Retriever", 18, 4, 1 ]
        ]
      });

      axiosInstance.get.mockResolvedValueOnce({
        data: [
          ["2024-12-11", "08:10:00", "D001", "Rabia", "Desc Prueba", "T001", "Antibioticos", "Desc Prueba", "Desc general" ]
        ]
      });

      axiosInstance.get.mockResolvedValueOnce({
        data: [
          [ "D001", "Rabia", "Desc Prueba" ]
        ]
      });

      axiosInstance.get.mockResolvedValueOnce({
        data: [
          [ "T001", "Antibioticos", "Desc Prueba" ]
        ]
      });

      axiosInstance.get.mockResolvedValueOnce({
        data: [
          [ "MS123", "lmatagod", "vet_test", "2024-12-11", "08:10:00", 1, "Perro", "Luis Mata", "Vet Test", "Vacunacion" ]
        ]
      });

      await act(async () => {
        render(
          <MemoryRouter initialEntries={["/veterinarios/mascotas/"]}>
            <Routes>
              <Route path='/veterinarios/mascotas' element={<VetMascotsPage />} />
              <Route path='/veterinarios/mascotas/:id' element={<MedHistory />} />
            </Routes>
          </MemoryRouter>
        );
      });

      await act(async () => {})

      const actionsButton = await waitFor(() =>
        screen.getByRole("button", { name: /actions/i })
      )

      fireEvent.click(actionsButton)

      const medHistoryButton = await waitFor(() =>
        screen.getByRole("button", { name: /medHistoryButton/i })
      )

      fireEvent.click(medHistoryButton)

      await waitFor(() => {
        expect(screen.getByText('Vash')).toBeDefined();
      })

    })
})


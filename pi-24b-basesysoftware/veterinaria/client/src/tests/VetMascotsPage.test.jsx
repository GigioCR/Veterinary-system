import { describe, expect, test, it, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import VetMascotsPage from '../components/vet/mascots/VetMascotsPage'
import axiosInstance from '../api/axiosInstance';

vi.mock('../api/axiosInstance')


describe('renders vet mascots page', () => {

    test('view mascots', async() => {

      axiosInstance.get.mockResolvedValue({
        data: [
          ["lmatagod", "Luis", "Mata", "MS123", "Vash", "Perro", "Golden Retriever", 18, 4, 1]
        ]
      });

      await act(async () => {
        render(
          <MemoryRouter initialEntries={["/veterinarios/mascotas"]}>
            <Routes>
              <Route path='/veterinarios/mascotas' element={<VetMascotsPage />} />
            </Routes>
          </MemoryRouter>
        );
      });

      expect(screen.getByText('Vash')).toBeDefined();

    })
})

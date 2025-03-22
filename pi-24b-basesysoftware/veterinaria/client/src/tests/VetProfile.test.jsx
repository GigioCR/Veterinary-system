import { describe, expect, test, it, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import VetProfile from '../components/vet/VetProfile';
import axiosInstance from '../api/axiosInstance';

vi.mock('../api/axiosInstance')

describe('renders vet profile', () => {

  test('renders vet profile', async() => {
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        ["vet_test", "Vet", "User", "vet@example.com", "adfadfgadfg", 1000, "Cosmetología" ]
      ]
    });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/veterinarios/perfil"]}>
          <Routes>
            <Route path='/veterinarios/perfil' element={<VetProfile />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(screen.getByDisplayValue('vet@example.com')).toBeDefined();

  })
})
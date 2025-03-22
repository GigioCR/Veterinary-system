import { describe, expect, test, it, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminProfile from '../components/admin/AdminProfile';
import axiosInstance from '../api/axiosInstance';

vi.mock('../api/axiosInstance')

describe('renders admin profile', () => {

  test('renders admin profile', async() => {
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        ["admin_test", "Admin", "User", "admin@example.com", "adfadfgadfg", 1000 ]
      ]
    });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/administradores/perfil"]}>
          <Routes>
            <Route path='/administradores/perfil' element={<AdminProfile />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(screen.getByDisplayValue('admin@example.com')).toBeDefined();

  })
})
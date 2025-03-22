import '@testing-library/jest-dom'; 
import { describe, expect, test, it, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
//import '@testing-library/jest-dom'; // Import jest-dom
import ModalUpdateCliente from '../components/clients/ModalUpdate';
import axiosInstance from '../api/axiosInstance';

vi.mock('../api/axiosInstance')

describe('ModalUpdateMascot', () => {
  test('displays correct initial values and updates input fields', async () => {
    const client = {
        USER_ID: "lmata",
        NOMBRE: "Luis",
        APELLIDO: "Mata", 
        CORREO: "lmata@gmail.com",
        DIRECCION: "En la fama"
    };

    await act(async () => {
      render(
        <ModalUpdateCliente 
          open={true} 
          onClose={() => {}} 
          client_p={client} 
          handleModificationSuccess={() => {}} 
        />
      );
    });

    // 1. Check initial values
    expect(screen.getByTestId("nombre")).toHaveValue(String(client.NOMBRE));
    expect(screen.getByTestId("apellido")).toHaveValue(String(client.APELLIDO));
    expect(screen.getByTestId("correo")).toHaveValue(String(client.CORREO));
    expect(screen.getByTestId("direccion")).toHaveValue(String(client.DIRECCION));

    // 2. Simulate user input to change values
    fireEvent.change(screen.getByTestId("nombre"), { target: { value: 'Daniel' } });
    fireEvent.change(screen.getByTestId("apellido"), { target: { value: 'Conejo' } });
    fireEvent.change(screen.getByTestId("correo"), { target: { value: 'danicon@gmail.com' } });
    fireEvent.change(screen.getByTestId("direccion"), { target: { value: 'Moravia' } });
    // 3. Assert that the values have changed
    expect(screen.getByTestId("nombre")).toHaveValue('Daniel');
    expect(screen.getByTestId("apellido")).toHaveValue('Conejo');
    expect(screen.getByTestId("correo")).toHaveValue('danicon@gmail.com');
    expect(screen.getByTestId("direccion")).toHaveValue('Moravia');
  });
});
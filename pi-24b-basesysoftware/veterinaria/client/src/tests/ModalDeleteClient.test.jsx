import { describe, expect, test, it, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ModalDeleteClient from '../components/clients/ModalDelete';
import axiosInstance from '../api/axiosInstance';

vi.mock('../api/axiosInstance')


describe('renders modalDeleteClient', () => {

    test('view modalDeleteCliente', async() => {

      const client = {
        USER_ID: "lmata",
        ESTADO: "1"
      }

      await act(async () => {
        render(
          <ModalDeleteClient open={true} onClose={()=>{}} client_p={client} handleModificationSuccess={()=>{}}/>
        );
      });

      expect(screen.getByText('Deshabilitar Cliente')).toBeDefined();
      expect(screen.getByText('Cancelar')).toBeDefined();
      expect(screen.getByText('¿Seguro que quiere deshabilitar al cliente?')).toBeDefined();
      //expect(screen.getByText('Deshabilitar')).toBeDefined()

    })

    test('view modalDeleteCliente deshabilitado', async() => {

        const client = {
          USER_ID: "lmata",
          ESTADO: "0"
        }
  
        await act(async () => {
          render(
            <ModalDeleteClient open={true} onClose={()=>{}} client_p={client} handleModificationSuccess={()=>{}}/>
          );
        });
  
        expect(screen.getByText('Habilitar Cliente')).toBeDefined();
        expect(screen.getByText('Cancelar')).toBeDefined();
        expect(screen.getByText('¿Seguro que quiere habilitar al cliente?')).toBeDefined();
        //expect(screen.getByText('Habilitar')).toBeDefined()
  
      })
})

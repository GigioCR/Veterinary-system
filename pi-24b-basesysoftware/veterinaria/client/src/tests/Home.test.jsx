import { describe, expect, test, it } from 'vitest';
import { render, screen, fireEvent } from "@testing-library/react";
import ServicioPage from '../components/servicios/ServicioPage';
import Home from '../components/home/Home';
import AdminDashboard from '../components/admin/AdminDashboard';
import { useState } from "react";

test('renders homepage', () => {
  render(<Home />);
  expect(screen.getByText('Veterinaria El Bigote')).toBeDefined();
});

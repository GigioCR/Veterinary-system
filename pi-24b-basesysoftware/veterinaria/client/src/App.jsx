import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './App.css';

import Login from './components/login/Login';
import PasswordResetRequest from './components/login/PasswordResetRequest';
import ResetPassword from './components/login/ResetPassword';

import ProtectedRoute from './components/routes/ProtectedRoute';
import ServicioPage from './components/servicios/ServicioPage';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminProfile from './components/admin/AdminProfile';
import Home from './components/home/Home';

import ViewClients from './components/clients/ViewClients';;
import AddClients from './components/clients/AddClient';;
import DeleteClient from './components/clients/ModalDelete';;

import AddMascot from './components/mascots/AddMascot';
import ViewMascots from './components/mascots/ViewMascots';
import ModalDeleteMascot from './components/mascots/ModalDeleteMascot';
import ModalUpdateMascot from './components/mascots/ModalUpdateMascot';

import VeterinariosPage from './components/veterinarios/VeterinariosPage';
import VeterinariosCreate from './components/veterinarios/VeterinariosCreate';
import VeterinariosUpdate from './components/veterinarios/VeterinariosUpdate';
import CitasPage from './components/citas/CitasPage';
import AdminPagosPage from './components/pagos/PagosPage';

import VetDashboard from './components/vet/VetDashboard';
import VetProfile from './components/vet/VetProfile';
import VetCitasPage from './components/vet/citas/VetCitasPage';
import VetMascotsPage from './components/vet/mascots/VetMascotsPage';
import MedHistory from './components/vet/mascots/MedHistory';

import ClientRegister from './components/client/ClientRegister';
import ClientDashboard from './components/client/ClientDashboard';
import ClientProfile from './components/client/ClientProfile';
import ClientCitasPage from './components/client/ClientCitasPage';
import ClientMascots from './components/client/ClientMascots'
import ClientAddMascots from './components/client/AddMascot'
import ClientMascotHistorial from './components/client/ClientMasotaMedHistory'
import PagosPage from './components/client/pagos/PagosPage';
import CheckoutSession from './components/client/pagos/CheckoutSession';
import CheckoutReturn from './components/client/pagos/CheckoutReturn';


function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-contrasena" element={<PasswordResetRequest />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<ClientRegister />} />;
        
        {/* Admin Protected Routes */}
        <Route path="/administradores" element={<ProtectedRoute role="administrador" redirectTo="/login" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="perfil" element={<AdminProfile />} />
          <Route path="servicios" element={<ServicioPage />} />
          <Route path="clientes" element={<ViewClients />} />
          <Route path="clientes/add" element={<AddClients />} />
          <Route path="clientes/delete" element={<DeleteClient />} />
          <Route path="mascotas" element={<ViewMascots/>} />
          <Route path="mascotas/add" element={<AddMascot/>} />
          <Route path="mascotas/delete" element={<ModalDeleteMascot/>} />
          <Route path="mascotas/update" element={<ModalUpdateMascot/>} />
          <Route path="veterinarios" element={<VeterinariosPage />} />
          <Route path="veterinarios/add" element={<VeterinariosCreate />} />
          <Route path="veterinarios/update/:id" element={<VeterinariosUpdate />} />
          <Route path="citas" element={<CitasPage />} />
          <Route path="pagos" element={<AdminPagosPage />} />
        </Route>

        {/* Vet Protected Routes */}
        <Route path="/veterinarios" element={<ProtectedRoute role="veterinario" redirectTo="/login" />}>
          <Route index element={<VetDashboard />} />
          <Route path="perfil" element={<VetProfile />} />
          <Route path="mascotas" element={<VetMascotsPage />} />
          <Route path="mascotas/:id" element={<MedHistory />} />
          <Route path="citas" element={<VetCitasPage />} />

        </Route>

        {/* Client Protected Routes */}
        <Route path="/clientes" element={<ProtectedRoute role="cliente" redirectTo="/login" />}>
          <Route index element={<ClientDashboard />} />
          <Route path="perfil" element={<ClientProfile />} />
          <Route path="citas" element={<ClientCitasPage />} />
          <Route path="mascotas" element={<ClientMascots />} />
          <Route path="mascotas/add" element={<ClientAddMascots />} />
          <Route path="mascotas/historial/:id" element={<ClientMascotHistorial />} />
          <Route path="pagos" element={<PagosPage />} />
          <Route path="pagos/:id" element={<CheckoutSession />} />
          <Route path="pagos/:id/retorno" element={<CheckoutReturn />} /> {/* temporary, change to modal? */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;;

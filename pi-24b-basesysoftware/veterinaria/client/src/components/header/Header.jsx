import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import logo from '../../assets/homeAssets/gatilloBlanquillo.png'
import './Header.css'

///REVIEW - We have two headers, one in Header and one in admin/Header. Logout funcionality is implemented in admin/header, so either this one needs to be updated or removed
// * This one is used by login.jsx
export default class Header extends React.Component {

  render() {
    return (
      <div>
        <Navbar expand="lg" className='mainNavbar'>
          <Container>
            <Navbar.Brand href="#home">
              <img
                src={logo}
                width="60"
                height="60"
                className="d-inline-block align-top"
                alt="Logo Veterinaria El Bigote"
              />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link href="/administradores">INICIO</Nav.Link>
                <Nav.Link href="#link">MI PERFIL</Nav.Link>
                <Nav.Link href="/">CERRAR SESIÓN</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </div>
    )
  }
}

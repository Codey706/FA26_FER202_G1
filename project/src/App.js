import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";

function App() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        {/* Logo / tên website */}
        <Navbar.Brand href="/">
          My React App
        </Navbar.Brand>

        {/* Nút menu khi màn hình nhỏ */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        {/* Nội dung Navbar */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/products">Products</Nav.Link>
            <Nav.Link href="/about">About</Nav.Link>
            <Nav.Link href="/contact">Contact</Nav.Link>
          </Nav>

          {/* Nút bên phải */}
          <Button variant="outline-light">
            Login
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default App;
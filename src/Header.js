// Header.tsx
import React from 'react';
import '../css/Header.css';
import Logo from "../assets/logo.png";

function Header() {
  return (
    <div className="header">
      <div className="logo">Customer Support Simulation</div>
      <div className="user-info">
        { <img src={Logo} alt="Decorative background" className="header-right-image" /> }
      </div>
    </div>
  );
};

export default Header;

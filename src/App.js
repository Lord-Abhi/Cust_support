import React from 'react';
//import VoiceTest from './VoiceTest.tsx';
import ChatBot from './ChatBot.js'
import './css/Header.css'
import Logo from "./assets/logo.png";

function App() {
  return (
    <div className="App">
      <div className="header">
        <div className="logo">Customer Support Simulation</div>
        <div className="user-info">
          { <img src={Logo} alt="Decorative background" className="header-right-image" /> }
        </div>
      </div>
      {/* <VoiceTest /> */}
      <ChatBot />
    </div>
  );
}

export default App;
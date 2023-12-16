import {Routes, Route } from "react-router-dom";
import Home from "./Pages/Home.jsx";
import ChatPage from "./Pages/ChatPage.jsx";
import RoomPage from "./components/screens/RoomPage.jsx";
import './App.css';
// import LoginPage from "./Pages/LoginPage.jsx";
function App() {
  return (
    <div className="App">
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chats" element={<ChatPage />} />
      {/* <Route path="/login" element={<LoginPage />} /> */}
      <Route path="/room/:roomId" element={<RoomPage />} />
    </Routes>
    </div>
  );
}

export default App;

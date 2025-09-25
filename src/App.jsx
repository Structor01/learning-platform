/* src/App.jsx */
import { AuthProvider, } from "./contexts/AuthContext";
import { ChatBotProvider } from "./components/bot/ChatBotProvider";
import "./App.css";
import { Router } from "./Router";

// Componente principal com roteamento
function App() {
  return (
    <AuthProvider>
      <ChatBotProvider>
        <Router />
      </ChatBotProvider>
    </AuthProvider>
  );
}

export default App;

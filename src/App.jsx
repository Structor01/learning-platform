/* src/App.jsx */
import { AuthProvider, } from "./contexts/AuthContext";
import { ChatBotProvider } from "./components/bot/ChatBotProvider";
import { CustomTourProvider } from "./contexts/TourProvider";
import "./App.css";
import { Router } from "./Router";

// Componente principal com roteamento
function App() {
  return (
    <AuthProvider>
      <CustomTourProvider>
        <ChatBotProvider>
          <Router />
        </ChatBotProvider>
      </CustomTourProvider>
    </AuthProvider>
  );
}

export default App;

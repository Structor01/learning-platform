/* src/App.jsx */
import { AuthProvider, } from "./contexts/AuthContext";
import { ChatBotProvider } from "./components/bot/ChatBotProvider";
import { CustomTourProvider } from "./contexts/TourProvider";
import "./App.css";
import { Router } from "./Router";
import { Toaster } from 'sonner';

// Componente principal com roteamento
function App() {
  return (
    <AuthProvider>
      <CustomTourProvider>
        <ChatBotProvider>
          <Toaster position="top-right" richColors />
          <Router />
        </ChatBotProvider>
      </CustomTourProvider>
    </AuthProvider>
  );
}

export default App;

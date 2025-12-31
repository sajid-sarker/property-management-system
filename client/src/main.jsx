import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // Global styles with design tokens
import { Provider } from "@/components/ui/provider";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      {/* For React Router */}
      <BrowserRouter>
        {/* For Chakra UI */}
        <Provider>
          <App />
        </Provider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);

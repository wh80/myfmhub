import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { PrimeReactProvider } from "primereact/api";
import { Provider } from "react-redux";
import { store } from "./store";
import ToastProvider from "./contexts/ToastContext";
import DeleteConfirmProvider from "./contexts/DeleteConfirmContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <ToastProvider>
          <DeleteConfirmProvider>
            <PrimeReactProvider>
              <App />
            </PrimeReactProvider>
          </DeleteConfirmProvider>
        </ToastProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>
);

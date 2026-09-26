import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from "react-redux";
import { store } from "./store/store";
import { ToastProvider } from './context/ToastContext.tsx'
import { loadConfig } from "./config";

const init = async () => {
  // Load runtime configuration from public/config.json before rendering
  await loadConfig();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Provider store={store}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </Provider>
    </StrictMode>,
  );
};

init();

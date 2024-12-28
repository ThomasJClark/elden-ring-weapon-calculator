import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import { AppStateProvider } from "./app/AppStateProvider";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <AppStateProvider>
      <App />
    </AppStateProvider>
  </React.StrictMode>,
);

import React from "react";
import ReactDOM from "react-dom/client";
import "katex/dist/katex.min.css";
import "@fontsource-variable/manrope";
import "@fontsource-variable/dm-sans";
import "./styles.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

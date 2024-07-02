import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { Layout } from "./Layout";
import "./index.css";

const root = document.createElement("div");
root.className = "container";
document.body.appendChild(root);
const rootDiv = ReactDOM.createRoot(root);
rootDiv.render(
  <React.StrictMode>
    <Layout>
      <App />
    </Layout>
  </React.StrictMode>
);

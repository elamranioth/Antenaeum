import React from "react";
import { createRoot } from "react-dom/client";
import Athenaeum from "../athenaeum.jsx";

if (!window.storage) {
  window.storage = {
    async get(key) {
      return window.localStorage.getItem(key);
    },
    async set(key, value) {
      window.localStorage.setItem(key, value);
    }
  };
}

createRoot(document.getElementById("root")).render(<Athenaeum />);

import React from "react";
import { createRoot } from "react-dom/client";
import Worksheet from "./worksheet";
import "../styles/main.css";

const pageElement = document.getElementById("root");

if (!pageElement) {
    throw new Error("Элемент с id='page' не найден в DOM");
}

const root = createRoot(pageElement);
root.render(<Worksheet />);

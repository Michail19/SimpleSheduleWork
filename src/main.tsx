import React from "react";
import { createRoot } from "react-dom/client";
import Worksheet1 from "./worksheet1";
import "../styles/main.css";

const pageElement = document.getElementById("root");

if (!pageElement) {
    throw new Error("Элемент с id='page' не найден в DOM");
}

const root = createRoot(pageElement);
root.render(<Worksheet1 />);

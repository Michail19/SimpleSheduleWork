import React from "react";
import { createRoot } from "react-dom/client";
import "../styles/index.css";
import MainCodeIndex from "./MainCodeIndex";

const pageElement = document.getElementById("head");

if (!pageElement) {
    throw new Error("Элемент с id='head' не найден в DOM");
}

const head = createRoot(pageElement);
head.render(<MainCodeIndex />);


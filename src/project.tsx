import React from "react";
import { createRoot } from "react-dom/client";
import GitHubProjects from "./GitHubProjects";
import "../styles/project.css";

const pageElement = document.getElementById("root");

if (!pageElement) {
     throw new Error("Элемент с id='root' не найден в DOM");
}

const root = createRoot(pageElement);
root.render(<GitHubProjects />);

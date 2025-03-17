import React from "react";
import { createRoot } from "react-dom/client";
import worksheet from "./worksheet";
import "./styles.css";

const root = createRoot(document.getElementById("root"));
root.render(<worksheet />);

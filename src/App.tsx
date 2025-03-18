import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

const Home = () => <h2>Главная страница</h2>;
const About = () => <h2>О нас</h2>;
const NotFound = () => <h2>404 - Страница не найдена</h2>;

const App = () => {
    return (
        <Router>
            <nav>
                <Link to="/">Главная</Link> | <Link to="/about">О нас</Link>
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};

export default App;

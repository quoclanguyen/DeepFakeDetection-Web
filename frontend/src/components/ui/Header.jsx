import React, { useState, useEffect } from "react";
import Button from "./Button";
import { delay } from "motion";
import { Link } from "react-router-dom";

const Header = () => {
    const [show, setShow] = useState(true);
    let lastScrollY = 0;

    const handleScroll = () => {
        if (window.scrollY > lastScrollY) {
            // Scroll down: hide header
            setShow(false);
            delay(() => { setShow(true);}, 0.46);
        } else {
            // Scroll up: show header
            setShow(true);
        }
        lastScrollY = window.scrollY;
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 w-full bg-white shadow-md z-50 flex items-center justify-between px-6 py-4 transition-transform duration-300 ${show ? 'transform translate-y-0' : 'transform translate-y-[-100%]'}`}
        >
            {/* Logo */}
            <a href="/" className="text-2xl font-bold text-gray-700 hover:text-gray-500 tracking-wide">
                DFR<sup className="text-xs">®</sup>
            </a>

            {/* Navigation Links */}
            <nav className="flex space-x-6 text-gray-700 font-semibold text-sm">
                <a href="#" className="hover:text-gray-900">PAGI GEN</a>
                <a href="#" className="hover:text-gray-900">DEEPWARE SCANNER</a>
                <a href="#" className="hover:text-gray-900">ABOUT US</a>
                <Link to="/login" className="hover:text-gray-900">LOGIN</Link>
            </nav>

            {/* Contact Button */}
            <Button variant="outline" className="border-gray-700 text-gray-700 hover:bg-gray-100">
                CONTACT US
            </Button>
        </header>
    );
};

export default Header;

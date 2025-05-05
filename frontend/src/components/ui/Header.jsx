import React, { useState, useEffect } from "react";
import Button from "./Button";
import { delay } from "motion";
import { Link } from "react-router-dom";

const Header = () => {
    const [show, setShow] = useState(true);
    const [email, setEmail] = useState("");
    let lastScrollY = 0;

    useEffect(() => {
        const token = localStorage.getItem("jwt_token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setEmail(payload.email || "");
            } catch (err) {
                console.error("Invalid JWT", err);
            }
        }
    }, []);

    const handleScroll = () => {
        if (window.scrollY > lastScrollY) {
            setShow(false);
            delay(() => {
                setShow(true);
            }, 0.46);
        } else {
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
            <a href="/" className="text-2xl font-bold text-gray-700 hover:text-gray-500 tracking-wide">
                DFR
            </a>

            {/* <a href="#" className="flex hover:text-gray-900">ABOUT US</a> */}
            <nav className="flex space-x-6 text-gray-700 font-semibold text-sm">
                {
                    !email ?
                        (
                            <Link to="/register" className="hover:text-gray-900">Register</Link>
                        ) : (<></>)
                }
                {
                    !email ?
                        (
                            <Link to="/login" className="hover:text-gray-900">Login</Link>
                        ) : (<></>)
                }
            </nav>

            {email ? (
                <Link
                    to="/account"
                    className="text-sm font-medium text-gray-700 truncate max-w-xs ml-4 hover:underline cursor-pointer"
                > {email} </Link>
            ) : (
                <></>
            )}
        </header>
    );
};

export default Header;

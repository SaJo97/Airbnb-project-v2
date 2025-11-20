import { Link, NavLink, useLocation } from "react-router";
import logo from "../assets/Naturly-logo 7.svg";
import background from "../assets/footer-airbnb.png";
import { CgProfile } from "react-icons/cg";
import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Button } from "./ui/button";
import DesktopFilter from "./DesktopFilter";
import MobileFilter from "./MobileFilter";
const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  // Check auth state from Redux
  const { token } = useSelector((state: RootState) => state.auth);
  const currentUser = !!token; // true if token exists, false otherwise

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLUListElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const closeMenu = () => {
    setIsOpen(false);
  };
  return (
    <nav
      className="xl:h-[201px] flex flex-col xl:flex-row justify-center md:justify-between border-b-0 pb-0.5 align-middle relative bg-cover bg-center text-white p-3 h-[90px] box-border md:h-[150px]"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      <ul className="flex justify-between items-center w-full">
        {/* Logo */}
        <h1>
          <Link to="/" className="cursor-pointer flex">
            <img
              src={logo}
              alt="Naturly logo"
              className="md:h-14 lg:h-20 lg:px h-6.5 lg:w-[200px] xl:w-[247px]"
            />
          </Link>
        </h1>
        {/* Only show full menu on homepage */}
        {isHome && <DesktopFilter />}

        <ul className="md:hidden flex items-center gap-4">
          {currentUser ? (
            <NavLink to="createhousing">
              <button className="text-[15px] cursor-pointer hover:underline">
                Skapa bostäder
              </button>
            </NavLink>
          ) : (
            <div className="hidden"></div>
          )}
          {/* Burger menu */}
          <div
            className="flex flex-col cursor-pointer md:hidden space-y-1.5"
            onClick={toggleMenu}
            ref={burgerRef}
          >
            <span
              className={`block w-7 h-[3px] bg-white transition-transform duration-300 ${
                isOpen ? "rotate-45 translate-y-2" : ""
              }`}
            ></span>
            <span
              className={`block w-7 h-[3px] bg-white transition-opacity duration-300 ${
                isOpen ? "opacity-0" : "opacity-100"
              }`}
            ></span>
            <span
              className={`block w-7 h-[3px] bg-white transition-transform duration-300 ${
                isOpen ? "-rotate-45 -translate-y-2.5" : ""
              }`}
            ></span>
          </div>
        </ul>

        {/* Dropdown menu */}
        <ul
          ref={menuRef}
          className={`absolute top-15 right-0 flex flex-col bg-[#063831] p-2 gap-3 rounded-md shadow-lg z-50 transition-all duration-300 md:hidden ${
            isOpen ? "flex" : "hidden"
          }`}
        >
          {currentUser ? (
            <>
              <li>
                <NavLink to="/account" onClick={closeMenu}>
                  <button className="bg-white text-[#063831] text-[15px] px-1 py-1 rounded hover:bg-[#ECF39E]">
                    Konto
                  </button>
                </NavLink>
              </li>
            </>
          ) : (
            <li>
              <NavLink to="/auth" onClick={closeMenu}>
                <button className="bg-white text-[#063831] text-[15px] px-1 py-1 rounded hover:bg-[#ECF39E]">
                  Logga in
                </button>
              </NavLink>
            </li>
          )}
        </ul>
        {currentUser ? (
          <>
            <ul className="hidden md:flex items-center gap-2">
              <li className="hidden md:flex">
                <NavLink to="createhousing">
                  <Button size={"sm"} className="bg-transparent ">
                    Skapa bostäder
                  </Button>
                </NavLink>
              </li>
              <li className="hidden md:flex xl:px-10 md:px-2">
                <NavLink to="account">
                  <CgProfile
                    size={63.75}
                    className="flex md:h-[50px] md:w-[50px] hover:text-[#ECF39E]"
                  />
                </NavLink>
              </li>
            </ul>
          </>
        ) : (
          <li className="hidden md:flex lg:text-[24px] md:text-[20px]">
            <NavLink to="auth" className="hover:underline">
              <span className="flex w-max">Logga in</span>
            </NavLink>
          </li>
        )}
      </ul>
      {isHome && <MobileFilter />}
    </nav>
  );
};
export default Navbar;

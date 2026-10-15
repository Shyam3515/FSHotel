import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Heart, Sun, Moon, Menu, X, User } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { ids } = useWishlist();
  const { user, logout } = useAuth();

  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = location.pathname === "/";
  const solid = !isHome || scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const close = () => setOpen(false);

  return (
    <header
      className={`navbar ${solid ? "navbar--solid" : "navbar--transparent"}`}
    >
      <div className="nav-inner">
        <Link className="brand" to="/" onClick={close}>
          HOTEL
          <span>
            <b> OǴ </b>
          </span>
        </Link>

        <nav className={open ? "nav-links open" : "nav-links"}>
          <NavLink to="/" onClick={close}>
            Home
          </NavLink>
          <NavLink to="/hotels" onClick={close}>
            Explore
          </NavLink>
          <NavLink to="/wishlist" onClick={close}>
            <Heart size={16} />
            Wished <b>{ids.length}</b>
          </NavLink>
          <NavLink to="/about" onClick={close}>
            About
          </NavLink>
          <NavLink to="/contact" onClick={close}>
            Contact
          </NavLink>
        </nav>

        <div className="nav-actions">
          <button
            className="icon-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user ? (
            <div className="user-menu">
              <Link to="/profile" className="user-link" onClick={close}>
                <User size={17} />
                {user.name.split(" ")[0]}
              </Link>
              <button
                className="link-btn"
                onClick={() => {
                  logout();
                  close();
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link className="text-login" to="/login" onClick={close}>
                Login
              </Link>
              <Link className="btn btn-sm" to="/signup" onClick={close}>
                Sign Up
              </Link>
            </>
          )}

          <button
            className="mobile-menu"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}

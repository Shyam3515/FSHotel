import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        {/* Brand */}
        <div>
          <Link className="brand" to="/" onClick={close}>
            HOTEL<span> OǴ </span>
          </Link>

          <p>Luxury stays, thoughtfully selected for unforgettable journeys.</p>

          <div className="socials">
            <a href="#" aria-label="Instagram">
              <FaInstagram />
            </a>

            <a href="#" aria-label="Facebook">
              <FaFacebookF />
            </a>

            <a href="#" aria-label="Twitter">
              <FaTwitter />
            </a>
          </div>
        </div>

        {/* Explore */}
        <div>
          <h4>Explore</h4>

          <Link to="/hotels">Hotels</Link>
          <Link to="/about">About us</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/my-bookings">My bookings</Link>
        </div>

        {/* Support */}
        <div>
          <h4>Support</h4>

          <Link to="/contact">Help centre</Link>
          <Link to="/contact">Cancellation</Link>
          <Link to="/contact">Privacy</Link>
          <Link to="/contact">Terms</Link>
        </div>

        {/* Contact */}
        <div>
          <h4>Contact</h4>

          <p>
            <MapPin size={15} />
            Hyderabad, India
          </p>

          <p>
            <Phone size={15} />
            +91 98765 43210
          </p>

          <p>
            <Mail size={15} />
            hello@hotelog.com
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} HOTELÉ. All rights reserved.
      </div>
    </footer>
  );
}

import { useNavigate } from "react-router-dom";
import { UserRound, Mail, Phone, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav("/");
  };

  return (
    <div className="page">
      <div className="page-hero small">
        <div className="container">
          <span className="eyebrow">ACCOUNT</span>
          <h1>Your profile.</h1>
        </div>
      </div>

      <section className="section">
        <div className="container narrow">
          <div className="profile-card">
            <div className="avatar">
              <UserRound size={35} />
            </div>

            <h2>{user?.name}</h2>
            <p>{user?.email}</p>

            <hr />

            <div className="profile-row">
              <Mail />
              <span>
                <small>Email</small>
                <strong>{user?.email}</strong>
              </span>
            </div>

            <div className="profile-row">
              <Phone />
              <span>
                <small>Phone</small>
                <strong>{user?.phone || "Not added"}</strong>
              </span>
            </div>

            <button className="btn btn-outline" onClick={handleLogout}>
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
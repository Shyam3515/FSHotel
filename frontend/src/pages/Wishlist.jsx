import { Link } from "react-router-dom";
import HotelCard from "../components/HotelCard";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

export default function Wishlist() {
  const { hotels, loading } = useWishlist();
  const { user } = useAuth();

  return (
    <section className="section page">
      <div className="wishlistHero">
        <p className="eyebrow">YOUR PRIVATE COLLECTION</p>
        <h1>Wished stays</h1>
        <p>Keep the places that caught your eye close at hand.</p>
      </div>

      {!user ? (
        <div className="empty">
          <h2>Sign in to save your favourites.</h2>
          <p>Your wishlist syncs across every device.</p>
          <Link className="btn" to="/login">
            Sign in
          </Link>
        </div>
      ) : loading ? (
        <p className="center">Loading wishlist…</p>
      ) : hotels.length ? (
        <div className="grid">
          {hotels.map((h) => (
            <HotelCard key={h.id} hotel={h} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <h2>Your wishlist is waiting.</h2>
          <p>Tap the heart on a hotel you love.</p>
          <Link className="btn" to="/hotels">
            Discover stays
          </Link>
        </div>
      )}
    </section>
  );
}
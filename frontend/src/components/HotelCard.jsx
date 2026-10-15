import { Heart, MapPin, Star, Wifi, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";

export default function HotelCard({ hotel }) {
    const { toggle, isWished } = useWishlist();
  return (
    <article className="hotel-card">
      <div className="hotel-image-wrap">
        <img src={hotel.image} alt={hotel.name} />
        <span className="badge">{hotel.category}</span>
        {/* <button className="heart-btn" aria-label="Save hotel">
          <Heart size={18} />
        </button> */}
        <button
          className={isWished(hotel.id) ? "heart active" : "heart"}
          onClick={() => toggle(hotel.id)}
          aria-label="Wishlist"
        >
          <Heart fill={isWished(hotel.id) ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="hotel-body">
        <div className="hotel-top">
          <div>
            <h3>{hotel.name}</h3>
            <p className="location">
              <MapPin size={14} />
              {hotel.location}
            </p>
          </div>
          <span className="rating">
            <Star size={14} fill="currentColor" />
            {hotel.rating}
          </span>
        </div>
        <div className="amenity-row">
          {hotel.amenities.slice(0, 3).map((a) => (
            <span key={a}>
              <Wifi size={12} />
              {a}
            </span>
          ))}
        </div>
        <div className="hotel-bottom">
          <div>
            <strong>₹{hotel.price.toLocaleString()}</strong>
            <small>/ night</small>
          </div>
          <Link className="view-link" to={`/hotels/${hotel.id}`}>
            View <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}

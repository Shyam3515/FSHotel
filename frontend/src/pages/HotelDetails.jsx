import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Star, Check, ArrowLeft, ShieldCheck } from "lucide-react";
import { fetchHotel } from "../services/hotelService";

export default function HotelDetails() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchHotel(id)
      .then(({ data }) => active && setHotel(data.hotel))
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Hotel not found");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="section container center">
        <p>Loading hotel…</p>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="section container center">
        <h2>{error || "Hotel not found"}</h2>
        <Link to="/hotels" className="btn">
          Back to stays
        </Link>
      </div>
    );
  }

  const gallery = hotel.images?.length ? hotel.images : [hotel.image];

  return (
    <div className="page">
      <section className="detail-gallery">
        <div className="container">
          <Link to="/hotels" className="back-link">
            <ArrowLeft size={16} /> Back to stays
          </Link>

          <div className="gallery">
            <img src={gallery[0]} alt={hotel.name} />
            <div>
              <img src={gallery[1] || gallery[0]} alt="" />
              <img src={gallery[2] || gallery[0]} alt="" />
            </div>
          </div>
        </div>
      </section>

      <section className="section detail-section">
        <div className="container detail-grid">
          <div>
            <span className="eyebrow">{hotel.category} COLLECTION</span>
            <h1>{hotel.name}</h1>

            <p className="location large">
              <MapPin size={17} />
              {hotel.location}
            </p>

            <div className="rating large">
              <Star size={16} fill="currentColor" />
              {hotel.rating} <span>({hotel.reviews} reviews)</span>
            </div>

            <p className="lead">{hotel.description}</p>

            <hr />
            <h2>What this stay offers</h2>

            <div className="amenity-list">
              {hotel.amenities.map((a) => (
                <span key={a}>
                  <Check size={16} />
                  {a}
                </span>
              ))}
            </div>

            <hr />
            <h2>About the property</h2>
            <p>
              Enjoy thoughtfully designed spaces, attentive hospitality and a
              calm setting designed to make your trip memorable.
            </p>
          </div>

          <aside className="booking-card">
            <span className="eyebrow">FROM</span>
            <div className="price-big">
              ₹{hotel.price.toLocaleString()} <small>/ night</small>
            </div>

            <div className="booking-rating">
              <Star size={15} fill="currentColor" /> {hotel.rating} · Excellent
            </div>

            <Link to={`/booking/${hotel.id}`} className="btn btn-full">
              Reserve this stay
            </Link>

            <div className="secure-note">
              <ShieldCheck size={16} /> Secure booking · No hidden fees
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
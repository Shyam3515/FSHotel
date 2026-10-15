import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";
import { getMyBookings } from "../services/bookingService";

export default function MyBookings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBookings()
      .then(({ data }) => setItems(data.bookings))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">YOUR JOURNEY</span>
          <h1>My bookings.</h1>
          <p>Everything you've reserved, in one place.</p>
        </div>
      </div>

      <section className="section">
        <div className="container narrow">
          {loading ? (
            <p className="center">Loading bookings…</p>
          ) : items.length ? (
            items.map((b) => (
              <article className="booking-list-card" key={b.id}>
                <div>
                  <span className="status">{b.status || "Confirmed"}</span>
                  <h3>{b.hotelName}</h3>
                  <p>
                    <CalendarDays size={15} />
                    {b.checkIn} → {b.checkOut}
                  </p>
                  <p>
                    <MapPin size={15} />
                    {b.roomType} · {b.guests} guest(s)
                  </p>
                </div>

                <div className="booking-list-right">
                  <strong>₹{Number(b.total || 0).toLocaleString()}</strong>
                  <Link to={`/bookings/${b.bookingId}`}>
                    Details <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <CalendarDays size={42} />
              <h2>No bookings yet</h2>
              <p>Find a beautiful stay and start your next journey.</p>
              <Link to="/hotels" className="btn">
                Explore hotels
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
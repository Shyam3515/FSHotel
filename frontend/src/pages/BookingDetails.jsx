import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { getBooking } from "../services/bookingService";

export default function BookingDetails() {
  const { id } = useParams();
  const [b, setB] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBooking(id)
      .then(({ data }) => setB(data.booking))
      .catch(() => setB(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="section container center">
        <p>Loading…</p>
      </div>
    );
  }

  if (!b) {
    return (
      <div className="section">
        <div className="container empty-state">
          <h2>Booking not found.</h2>
          <Link to="/my-bookings" className="btn">
            Back to bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="section">
        <div className="container narrow">
          <Link to="/my-bookings" className="back-link">
            <ArrowLeft size={16} /> Back to bookings
          </Link>

          <div className="detail-booking">
            <div className="detail-booking-head">
              <div>
                <span className="status">{b.status}</span>
                <h1>{b.hotelName}</h1>
                <p>Booking reference: {b.bookingId}</p>
              </div>
              <CheckCircle2 size={42} />
            </div>

            <div className="booking-info-grid">
              <div>
                <span>Check-in</span>
                <strong>{b.checkIn}</strong>
              </div>
              <div>
                <span>Check-out</span>
                <strong>{b.checkOut}</strong>
              </div>
              <div>
                <span>Guests</span>
                <strong>{b.guests}</strong>
              </div>
              <div>
                <span>Room</span>
                <strong>{b.roomType}</strong>
              </div>
            </div>

            <div className="summary-row total">
              <span>Total paid</span>
              <strong>₹{Number(b.total || 0).toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
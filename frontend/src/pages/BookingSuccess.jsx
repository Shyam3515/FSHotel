import { CheckCircle2, ArrowRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export default function BookingSuccess() {
  const { bookingId } = useParams();

  return (
    <div className="success-page">
      <div className="success-card">
        <CheckCircle2 className="success-icon" size={72} />
        <span className="eyebrow">BOOKING CONFIRMED</span>
        <h1>Your stay is reserved.</h1>
        <p>
          Your booking reference is <strong>{bookingId}</strong>. A confirmation
          will be sent to your email.
        </p>

        <div className="success-actions">
          <Link to="/my-bookings" className="btn">
            View my bookings <ArrowRight size={17} />
          </Link>
          <Link to="/hotels" className="btn btn-outline">
            Explore more stays
          </Link>
        </div>
      </div>
    </div>
  );
}
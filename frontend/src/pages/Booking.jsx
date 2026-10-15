import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CalendarDays, Users, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchHotel } from "../services/hotelService";
import { createBooking } from "../services/bookingService";

export default function Booking() {
  const { hotelId } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [form, setForm] = useState({
    checkIn: "",
    checkOut: "",
    guests: "2",
    roomType: "Deluxe Room",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHotel(hotelId)
      .then(({ data }) => setHotel(data.hotel))
      .catch(() => setHotel(null));
  }, [hotelId]);

  const nights =
    form.checkIn && form.checkOut
      ? Math.max(
          1,
          Math.ceil(
            (new Date(form.checkOut) - new Date(form.checkIn)) / 86400000
          )
        )
      : 0;

  const total = hotel && nights ? nights * hotel.price : 0;

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!nights) {
      setError("Please select valid check-in and check-out dates.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await createBooking({
        hotelId: hotel.id,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: form.guests,
        roomType: form.roomType,
      });
      nav(`/payment/${data.booking.bookingId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create booking.");
    } finally {
      setLoading(false);
    }
  };

  if (!hotel) {
    return (
      <div className="section container center">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-hero small">
        <div className="container">
          <span className="eyebrow">RESERVE YOUR STAY</span>
          <h1>Complete your booking.</h1>
        </div>
      </div>

      <section className="section">
        <div className="container booking-layout">
          <form className="form-card" onSubmit={submit}>
            <h2>Stay details</h2>

            {error && <div className="form-error">{error}</div>}

            <div className="form-grid">
              <label>
                Check-in
                <div className="input-icon">
                  <CalendarDays />
                  <input
                    required
                    type="date"
                    value={form.checkIn}
                    onChange={(e) =>
                      setForm({ ...form, checkIn: e.target.value })
                    }
                  />
                </div>
              </label>

              <label>
                Check-out
                <div className="input-icon">
                  <CalendarDays />
                  <input
                    required
                    type="date"
                    value={form.checkOut}
                    onChange={(e) =>
                      setForm({ ...form, checkOut: e.target.value })
                    }
                  />
                </div>
              </label>
            </div>

            <label>
              Guests
              <div className="input-icon">
                <Users />
                <select
                  value={form.guests}
                  onChange={(e) => setForm({ ...form, guests: e.target.value })}
                >
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5</option>
                </select>
              </div>
            </label>

            <label>
              Room type
              <select
                value={form.roomType}
                onChange={(e) => setForm({ ...form, roomType: e.target.value })}
              >
                <option>Deluxe Room</option>
                <option>Premium Room</option>
                <option>Suite</option>
              </select>
            </label>

            <h2>Guest information</h2>

            <div className="form-grid">
              <label>
                Name
                <input value={user?.name || ""} readOnly />
              </label>
              <label>
                Email
                <input value={user?.email || ""} readOnly />
              </label>
            </div>

            <button className="btn btn-full" type="submit" disabled={loading}>
              {loading ? "Processing…" : "Continue to payment"}
            </button>
          </form>

          <aside className="booking-card">
            <img src={hotel.image} alt={hotel.name} />
            <h3>{hotel.name}</h3>
            <p className="location">{hotel.location}</p>
            <hr />

            <div className="summary-row">
              <span>
                ₹{hotel.price.toLocaleString()} × {nights || 0} nights
              </span>
              <strong>₹{total.toLocaleString()}</strong>
            </div>

            <div className="summary-row">
              <span>Taxes &amp; fees</span>
              <strong>₹0</strong>
            </div>

            <hr />

            <div className="summary-row total">
              <span>Total</span>
              <strong>₹{total.toLocaleString()}</strong>
            </div>

            <p className="secure-note">
              <ShieldCheck size={16} /> You won't be charged until payment is
              completed.
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CreditCard, ShieldCheck, Loader2 } from "lucide-react";
import { getBooking } from "../services/bookingService";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../services/paymentService";

export default function Payment() {
  const { bookingId } = useParams();
  const nav = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  /* Fetch booking on mount */
  useEffect(() => {
    getBooking(bookingId)
      .then(({ data }) => setBooking(data.booking))
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [bookingId]);

  /* Redirect to success if already paid */
  useEffect(() => {
    if (booking?.paymentStatus === "Paid") {
      nav(`/booking-success/${bookingId}`, { replace: true });
    }
  }, [booking, bookingId, nav]);

  /* =========================================================
     Razorpay checkout
     ========================================================= */
  const handlePayment = async () => {
    setError("");

    if (!window.Razorpay) {
      setError("Razorpay SDK not loaded. Refresh the page and try again.");
      return;
    }

    try {
      setPaying(true);

      /* 1. Create order on backend */
      const { data } = await createRazorpayOrder(bookingId);

      /* 2. Configure Razorpay checkout */
      const options = {
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "HOTELOǴ",
        description: `${data.booking.hotelName} · ${data.booking.checkIn} → ${data.booking.checkOut}`,
        order_id: data.order.id,
        image:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=80",

        prefill: {
          name: data.user.name,
          email: data.user.email,
          contact: data.user.phone || "",
        },

        notes: {
          bookingId: data.booking.bookingId,
          hotelName: data.booking.hotelName,
        },

        theme: { color: "#bd8b32" },

        /* 3. On success → verify signature on backend */
        handler: async (response) => {
          try {
            await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId,
            });
            nav(`/booking-success/${bookingId}`, { replace: true });
          } catch (err) {
            setError(
              err.response?.data?.message ||
                "Payment verification failed. Please contact support.",
            );
            setPaying(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        setError(
          response?.error?.description || "Payment failed. Please try again.",
        );
        setPaying(false);
      });

      rzp.open();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not start payment. Please try again.",
      );
      setPaying(false);
    }
  };

  /* =========================================================
     Loading / not-found states
     ========================================================= */
  if (loading) {
    return (
      <div className="section container center">
        <p>Loading…</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="section container center">
        <h2>Booking session expired.</h2>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-hero small">
        <div className="container">
          <span className="eyebrow">SECURE CHECKOUT</span>
          <h1>Complete payment.</h1>
        </div>
      </div>

      <section className="section">
        <div className="container payment-layout">
          <div className="form-card">
            <div className="payment-title">
              <CreditCard />
              <div>
                <h2>Pay with Razorpay</h2>
                <p>
                  Cards · UPI · Netbanking · Wallets — all in one secure flow.
                </p>
              </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div
              style={{
                padding: "14px 16px",
                background: "var(--surface2)",
                borderRadius: 10,
                fontSize: 13,
                color: "var(--muted)",
                lineHeight: 1.7,
              }}
            >
              <strong style={{ color: "var(--text)" }}>Secure payment</strong>
              <br />
              You'll be redirected to Razorpay's secure checkout to complete the
              payment. Do not close the window during processing.
            </div>

            <button
              className="btn btn-full"
              onClick={handlePayment}
              disabled={paying}
            >
              {paying ? (
                <>
                  <Loader2
                    size={17}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Processing…
                </>
              ) : (
                `Pay ₹${Number(booking.total || 0).toLocaleString()} securely`
              )}
            </button>

            <p className="secure-note">
              <ShieldCheck size={16} /> Payments are PCI-DSS compliant and
              encrypted.
            </p>
          </div>

          <aside className="booking-card">
            <span className="eyebrow">BOOKING SUMMARY</span>
            <h3>{booking.hotelName}</h3>
            <p>
              {booking.checkIn} → {booking.checkOut}
            </p>
            <p>
              {booking.guests} guest(s) · {booking.roomType}
            </p>
            <hr />
            <div className="summary-row total">
              <span>Total</span>
              <strong>₹{Number(booking.total || 0).toLocaleString()}</strong>
            </div>
          </aside>
        </div>
      </section>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

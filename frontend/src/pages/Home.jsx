import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Headphones,
  Quote,
} from "lucide-react";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import SectionHeading from "../components/SectionHeading";
import HotelCard from "../components/HotelCard";
import { reviews } from "../data/mockData";
import { fetchHotels, fetchDestinations } from "../services/hotelService";

export default function Home() {
  const [hotels, setHotels] = useState([]);
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    fetchHotels({ limit: 3, sort: "rating" })
      .then(({ data }) => setHotels(data.hotels))
      .catch(() => setHotels([]));

    fetchDestinations()
      .then(({ data }) => setDestinations(data.destinations))
      .catch(() => setDestinations([]));
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-overlay" />
        <div className="container hero-content">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="eyebrow light"
          >
            THE ART OF STAYING
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Find your
            <br />
            <em>perfect escape.</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Luxury stays. Memorable experiences. Places chosen for the way you
            want to feel.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SearchBar />
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="WANDER MORE"
            title="Destinations worth discovering"
            text="From sun-soaked beaches to quiet mountain retreats, find a place that feels like yours."
          />

          <div className="destination-grid">
            {destinations.map((d) => (
              <motion.div
                whileHover={{ y: -8 }}
                key={d.name}
                style={{ display: "block" }}
              >
                <Link
                  to={`/hotels?location=${encodeURIComponent(d.name)}`}
                  className="destination-card"
                >
                  <img src={d.image} alt={d.name} />
                  <div>
                    <h3>{d.name}</h3>
                    <span>{d.count}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section muted">
        <div className="container">
          <SectionHeading
            eyebrow="STAY DIFFERENT"
            title="Handpicked stays"
            text="A curated collection of hotels selected for design, comfort and unforgettable hospitality."
          />

          <div className="hotel-grid">
            {hotels.map((h) => (
              <HotelCard key={h.id} hotel={h} />
            ))}
          </div>

          <div className="center-btn">
            <Link to="/hotels" className="btn btn-outline">
              Explore all stays <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="feature-grid">
            <div className="feature-copy">
              <span className="eyebrow">WHY HOTELOǴ</span>
              <h2>
                More than a room.
                <br />
                <em>A feeling.</em>
              </h2>
              <p>
                We make discovering and booking exceptional stays feel
                effortless—from your first search to the moment you arrive.
              </p>

              <div className="feature-list">
                <div>
                  <ShieldCheck />
                  <span>
                    <b>Trusted stays</b>
                    <small>Verified properties and secure booking.</small>
                  </span>
                </div>
                <div>
                  <Sparkles />
                  <span>
                    <b>Curated quality</b>
                    <small>Thoughtfully selected hotels.</small>
                  </span>
                </div>
                <div>
                  <Headphones />
                  <span>
                    <b>Human support</b>
                    <small>Help whenever your journey needs it.</small>
                  </span>
                </div>
              </div>
            </div>

            <div className="feature-image">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
                alt="Luxury hotel interior"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="luxury-banner">
        <div className="container">
          <div>
            <span className="eyebrow light">YOUR NEXT ESCAPE</span>
            <h2>
              Make room for
              <br />
              <em>beautiful moments.</em>
            </h2>
          </div>

          <Link to="/hotels" className="btn btn-light">
            Discover stays <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="GUEST NOTES"
            title="Loved by travellers"
            center
          />

          <div className="review-grid">
            {reviews.map((r) => (
              <article className="review-card" key={r.name}>
                <Quote />
                <div className="stars">★★★★★</div>
                <p>“{r.text}”</p>
                <strong>{r.name}</strong>
                <span>{r.city}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

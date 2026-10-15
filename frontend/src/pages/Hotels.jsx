import { useEffect, useState } from "react";
import { SlidersHorizontal, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import HotelCard from "../components/HotelCard";
import SearchBar from "../components/SearchBar";
import { fetchHotels } from "../services/hotelService";

export default function Hotels() {
  const [params] = useSearchParams();

  const [query, setQuery] = useState(params.get("location") || "");
  const [category, setCategory] = useState("All");
  const [max, setMax] = useState(15000);
  const [sort, setSort] = useState("recommended");

  const [hotels, setHotels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- Load categories once ---------- */
  useEffect(() => {
    fetchHotels()
      .then(({ data }) => {
        setCategories([...new Set(data.hotels.map((h) => h.category))]);
      })
      .catch(() => setCategories([]));
  }, []);

  /* ---------- Load hotels on filter change (debounced) ---------- */
  useEffect(() => {
    let active = true;
    setLoading(true);

    const timer = setTimeout(() => {
      fetchHotels({ q: query, category, maxPrice: max, sort })
        .then(({ data }) => active && setHotels(data.hotels))
        .catch(() => active && setHotels([]))
        .finally(() => active && setLoading(false));
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, category, max, sort]);

  const reset = () => {
    setCategory("All");
    setMax(15000);
    setQuery("");
    setSort("recommended");
  };

  return (
    <div className="page">
      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">EXPLORE</span>
          <h1>Find your next stay.</h1>
          <p>Search our collection of distinctive hotels, resorts and retreats.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <SearchBar compact />

          <div className="results-layout">
            <aside className="filters">
              <div className="filter-title">
                <span>
                  <SlidersHorizontal size={18} />
                  Filters
                </span>
                <button onClick={reset}>Reset</button>
              </div>

              <label>
                Search
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="City, hotel..."
                />
              </label>

              <label>
                Category
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>All</option>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label>
                Max price: ₹{max.toLocaleString()}
                <input
                  type="range"
                  min="3000"
                  max="15000"
                  step="500"
                  value={max}
                  onChange={(e) => setMax(Number(e.target.value))}
                />
              </label>
            </aside>

            <div className="results">
              <div className="results-head">
                <div>
                  <span className="eyebrow">AVAILABLE STAYS</span>
                  <h2>
                    {loading ? "Searching…" : `${hotels.length} properties found`}
                  </h2>
                </div>

                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="recommended">Recommended</option>
                  <option value="price_asc">Price: Low to high</option>
                  <option value="price_desc">Price: High to low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>

              {hotels.length ? (
                <div className="hotel-grid">
                  {hotels.map((h) => (
                    <HotelCard key={h.id} hotel={h} />
                  ))}
                </div>
              ) : (
                !loading && (
                  <div className="empty-state">
                    <Search size={38} />
                    <h3>No stays found</h3>
                    <p>Try another destination or adjust your filters.</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
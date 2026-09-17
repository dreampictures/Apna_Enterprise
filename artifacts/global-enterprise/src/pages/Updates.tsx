import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  FaArrowRight, FaBookmark, FaBriefcase, FaBullhorn, FaBuilding,
  FaCalendarAlt, FaCheckCircle, FaClock, FaEnvelope, FaFileAlt,
  FaHandHoldingUsd, FaList, FaSearch, FaStar, FaThLarge, FaTimes,
  FaUsers,
} from "react-icons/fa";
import Seo from "@/components/Seo";
import { useT } from "@/i18n";

interface Announcement {
  id: number;
  title: string;
  slug: string;
  shortDesc?: string;
  category: string;
  department?: string;
  publishDate?: string;
  startDate?: string;
  lastDate?: string;
  vacancyCount?: number;
  applyUrl?: string;
  isUrgent: boolean;
  isFeatured: boolean;
  isExpired: boolean;
}

type StatusFilter = "All" | "Active" | "Closing Soon" | "Closed";
type ViewMode = "grid" | "list";

const CATEGORIES = [
  { id: "All", label: "All Updates", icon: FaThLarge },
  { id: "Government Job", label: "Govt Jobs", icon: FaBriefcase },
  { id: "Admit Card", label: "Admit Card", icon: FaFileAlt },
  { id: "Result", label: "Result", icon: FaCheckCircle },
  { id: "Govt Scheme", label: "Schemes", icon: FaHandHoldingUsd },
  { id: "Govt Notice", label: "Notices", icon: FaFileAlt },
  { id: "Announcement", label: "Announcements", icon: FaBullhorn },
  { id: "Offer / Update", label: "Offers", icon: FaStar },
] as const;

const CATEGORY_STYLE: Record<string, { className: string; label: string }> = {
  "Government Job": { className: "is-blue", label: "Government Job" },
  "Admit Card": { className: "is-green", label: "Admit Card" },
  Result: { className: "is-purple", label: "Result" },
  "Govt Scheme": { className: "is-gold", label: "Govt Scheme" },
  "Govt Notice": { className: "is-cyan", label: "Notice" },
  Announcement: { className: "is-red", label: "Announcement" },
  "Offer / Update": { className: "is-pink", label: "Offer" },
};

function fmtDate(date?: string) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusOf(item: Announcement): Exclude<StatusFilter, "All"> {
  if (item.isExpired) return "Closed";
  if (item.lastDate) {
    const remaining = new Date(item.lastDate).getTime() - Date.now();
    if (remaining >= 0 && remaining <= 14 * 24 * 60 * 60 * 1000) return "Closing Soon";
  }
  return "Active";
}

function SkeletonCard() {
  return (
    <div className="updates-page__card updates-page__skeleton" aria-hidden="true">
      <span /><span /><span /><span />
    </div>
  );
}

export default function Updates() {
  const [, navigate] = useLocation();
  const { t } = useT();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("All");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("latest");
  const [view, setView] = useState<ViewMode>("grid");
  const [page, setPage] = useState(0);
  const [saved, setSaved] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem("saved-updates") || "[]"); }
    catch { return []; }
  });
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const limit = 12;

  useEffect(() => {
    setLoading(true);
    fetch("/api/announcements?limit=500&offset=0&published=1")
      .then((response) => response.json())
      .then((data) => setItems(data.announcements || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => setPage(0), [activeCategory, activeStatus, searchQuery, sort]);

  const categoryCounts = useMemo(() => Object.fromEntries(
    CATEGORIES.map(({ id }) => [
      id,
      id === "All" ? items.length : items.filter((item) => item.category === id).length,
    ]),
  ), [items]);

  const statusCounts = useMemo(() => ({
    All: items.length,
    Active: items.filter((item) => statusOf(item) === "Active").length,
    "Closing Soon": items.filter((item) => statusOf(item) === "Closing Soon").length,
    Closed: items.filter((item) => statusOf(item) === "Closed").length,
  }), [items]);

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return items
      .filter((item) => activeCategory === "All" || item.category === activeCategory)
      .filter((item) => activeStatus === "All" || statusOf(item) === activeStatus)
      .filter((item) => !query || [item.title, item.shortDesc, item.department, item.category]
        .some((value) => value?.toLowerCase().includes(query)))
      .sort((a, b) => {
        const aDate = new Date(a.publishDate || a.startDate || 0).getTime();
        const bDate = new Date(b.publishDate || b.startDate || 0).getTime();
        return sort === "oldest" ? aDate - bDate : bDate - aDate;
      });
  }, [items, activeCategory, activeStatus, searchQuery, sort]);

  const visibleItems = filtered.slice(page * limit, (page + 1) * limit);
  const pageCount = Math.max(1, Math.ceil(filtered.length / limit));

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setSearchQuery(searchInput.trim());
  }

  function toggleSaved(id: number) {
    setSaved((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem("saved-updates", JSON.stringify(next));
      return next;
    });
  }

  function subscribe(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  }

  return (
    <div className="updates-page">
      <Seo
        title="Updates & Announcements — Govt Jobs, Results, Schemes"
        description="Latest government job notifications, admit cards, results, schemes and announcements. Stay updated with Apna Enterprise."
        keywords="government jobs Firozepur, admit card, result, govt scheme Punjab, announcements"
        path="/updates"
      />

      <section className="updates-page__hero">
        <img
          src="/assets/updates/hero-updates.png"
          alt=""
          aria-hidden="true"
          className="updates-page__hero-image"
          onError={(event) => { event.currentTarget.style.visibility = "hidden"; }}
        />
        <div className="container mx-auto px-4 lg:px-8">
          <div className="updates-page__hero-grid">
            <div className="updates-page__hero-copy">
              <p className="updates-page__eyebrow">{t.updates_stay_informed}</p>
              <h1>Updates &amp; <span>Announcements</span></h1>
              <p>{t.updates_subtitle}</p>
              <form className="updates-page__search" onSubmit={submitSearch}>
                <FaSearch />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search jobs, schemes, results, notices..."
                  aria-label="Search updates"
                />
                {searchInput && (
                  <button type="button" className="updates-page__search-clear" onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                  }} aria-label="Clear search"><FaTimes /></button>
                )}
                <button type="submit" className="updates-page__search-submit">Search</button>
              </form>
            </div>
            <div className="updates-page__hero-slot" aria-hidden="true" />
          </div>
        </div>
      </section>

      <nav className="updates-page__category-nav" aria-label="Update categories">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="updates-page__category-nav-inner">
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={activeCategory === id ? "is-active" : ""}
                onClick={() => setActiveCategory(id)}
              >
                <Icon /> {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="updates-page__main">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="updates-page__layout">
            <aside className="updates-page__sidebar">
              <div className="updates-page__filter-title"><FaSearch /> Filter Updates</div>
              <fieldset>
                <legend>Categories</legend>
                {CATEGORIES.map(({ id, label }) => (
                  <label key={id}>
                    <input
                      type="radio"
                      name="update-category"
                      checked={activeCategory === id}
                      onChange={() => setActiveCategory(id)}
                    />
                    <span>{label}</span><b>{categoryCounts[id] || 0}</b>
                  </label>
                ))}
              </fieldset>
              <fieldset>
                <legend>Status</legend>
                {(["All", "Active", "Closing Soon", "Closed"] as StatusFilter[]).map((status) => (
                  <label key={status}>
                    <input
                      type="radio"
                      name="update-status"
                      checked={activeStatus === status}
                      onChange={() => setActiveStatus(status)}
                    />
                    <i className={`updates-page__status-dot is-${status.toLowerCase().replace(" ", "-")}`} />
                    <span>{status}</span><b>{statusCounts[status]}</b>
                  </label>
                ))}
              </fieldset>
            </aside>

            <section className="updates-page__results">
              <header className="updates-page__results-head">
                <strong>{filtered.length} Updates Found</strong>
                <div>
                  <label>Sort by:
                    <select value={sort} onChange={(event) => setSort(event.target.value)}>
                      <option value="latest">Latest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </label>
                  <button className={view === "grid" ? "is-active" : ""} onClick={() => setView("grid")} aria-label="Grid view"><FaThLarge /></button>
                  <button className={view === "list" ? "is-active" : ""} onClick={() => setView("list")} aria-label="List view"><FaList /></button>
                </div>
              </header>

              {loading ? (
                <div className="updates-page__cards">
                  {Array.from({ length: 6 }, (_, index) => <SkeletonCard key={index} />)}
                </div>
              ) : visibleItems.length === 0 ? (
                <div className="updates-page__empty">
                  <FaBullhorn />
                  <strong>{t.updates_no_items}</strong>
                  <p>{t.updates_no_items_sub}</p>
                </div>
              ) : (
                <div className={`updates-page__cards${view === "list" ? " is-list" : ""}`}>
                  {visibleItems.map((item) => {
                    const category = CATEGORY_STYLE[item.category] || { className: "is-blue", label: item.category };
                    const status = statusOf(item);
                    return (
                      <article
                        key={item.id}
                        className={`updates-page__card${item.isUrgent ? " is-urgent" : ""}`}
                        onClick={() => navigate(`/updates/${item.slug}`)}
                      >
                        <div className="updates-page__badges">
                          <div>
                            <span className={`updates-page__category-badge ${category.className}`}>{category.label}</span>
                            {item.isUrgent && <span className="updates-page__urgent">Urgent</span>}
                          </div>
                          <span className={`updates-page__status is-${status.toLowerCase().replace(" ", "-")}`}>{status}</span>
                        </div>
                        <h2>{item.title}</h2>
                        {item.shortDesc && <p className="updates-page__description">{item.shortDesc}</p>}
                        <div className="updates-page__meta">
                          {item.department && <span><FaBuilding /> {item.department}</span>}
                          {item.vacancyCount ? <span><FaUsers /> {item.vacancyCount.toLocaleString()} {t.updates_vacancies}</span> : null}
                          <span><FaCalendarAlt /> {fmtDate(item.publishDate || item.startDate) || "Recently updated"}</span>
                          {item.lastDate && (
                            <span className={status === "Closed" || status === "Closing Soon" ? "is-important" : ""}>
                              <FaClock /> {t.updates_last_date} {fmtDate(item.lastDate)}
                            </span>
                          )}
                        </div>
                        <footer onClick={(event) => event.stopPropagation()}>
                          <Link href={`/updates/${item.slug}`}>Read More <FaArrowRight /></Link>
                          <button
                            className={saved.includes(item.id) ? "is-saved" : ""}
                            onClick={() => toggleSaved(item.id)}
                            aria-label={saved.includes(item.id) ? "Remove bookmark" : "Save update"}
                            title="Save update"
                          ><FaBookmark /></button>
                        </footer>
                      </article>
                    );
                  })}
                </div>
              )}

              {!loading && filtered.length > limit && (
                <div className="updates-page__pagination">
                  <button disabled={page === 0} onClick={() => setPage((current) => current - 1)}>{t.updates_prev}</button>
                  <span>{page + 1} / {pageCount}</span>
                  <button disabled={page + 1 >= pageCount} onClick={() => setPage((current) => current + 1)}>{t.updates_next}</button>
                </div>
              )}
            </section>
          </div>

          <section className="updates-page__subscribe">
            <div className="updates-page__subscribe-icon"><FaEnvelope /></div>
            <div className="updates-page__subscribe-copy">
              <span>GET INSTANT UPDATES</span>
              <h2>Subscribe for Latest Updates</h2>
              <p>Be the first to know about new jobs, admit cards, results and important notices.</p>
            </div>
            <form onSubmit={subscribe}>
              <div><FaEnvelope /><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email address..." /></div>
              <button type="submit">Subscribe</button>
            </form>
            <small>{subscribed ? "Thank you for subscribing." : "No spam. Only important updates."}</small>
          </section>
        </div>
      </main>
    </div>
  );
}
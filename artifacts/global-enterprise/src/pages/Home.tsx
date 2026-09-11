import type { ElementType } from "react";
import { Link } from "wouter";
import {
  FaArrowRight,
  FaBolt,
  FaBoxOpen,
  FaClock,
  FaDesktop,
  FaFileAlt,
  FaHeadset,
  FaIdCard,
  FaPlane,
  FaPrint,
  FaRocket,
  FaShieldAlt,
  FaUniversity,
  FaUsers,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { SERVICE_CATEGORIES } from "@/lib/services";
import Seo from "@/components/Seo";
import { useT } from "@/i18n";

const CATEGORY_ICONS: Record<string, ElementType> = {
  travel: FaPlane,
  documents: FaIdCard,
  forms: FaFileAlt,
  digital: FaPrint,
  financial: FaUniversity,
  insurance: FaShieldAlt,
  parcel: FaBoxOpen,
};

const CATEGORY_COLORS: Record<string, { icon: string; tag: string }> = {
  travel: { icon: "linear-gradient(135deg, #0f5ed7, #3c9df6)", tag: "blue" },
  documents: { icon: "linear-gradient(135deg, #0f9c78, #39c49a)", tag: "green" },
  forms: { icon: "linear-gradient(135deg, #7135d2, #a16df4)", tag: "purple" },
  digital: { icon: "linear-gradient(135deg, #df7915, #f6b63f)", tag: "orange" },
  financial: { icon: "linear-gradient(135deg, #dc245c, #f47793)", tag: "pink" },
  insurance: { icon: "linear-gradient(135deg, #235ac5, #67a8f8)", tag: "indigo" },
  parcel: { icon: "linear-gradient(135deg, #d59b08, #f5cc4f)", tag: "yellow" },
};

const TAG_COLORS: Record<string, string> = {
  blue: "home-service-tag--blue",
  green: "home-service-tag--green",
  purple: "home-service-tag--purple",
  orange: "home-service-tag--orange",
  pink: "home-service-tag--pink",
  indigo: "home-service-tag--indigo",
  yellow: "home-service-tag--yellow",
};

export default function Home() {
  const totalServices = SERVICE_CATEGORIES.reduce((acc, category) => acc + category.services.length, 0);
  const { t } = useT();
  const bullets = [t.home_bullet1, t.home_bullet2, t.home_bullet3, t.home_bullet4];

  const proofPoints = [
    { icon: FaUsers, value: "10,000+", label: t.home_happy_customers, tone: "yellow" },
    { icon: FaBolt, value: `${totalServices}+`, label: t.home_services_available, tone: "blue" },
    { icon: FaShieldAlt, value: "5+ Years", label: t.home_trusted_since, tone: "green" },
    { icon: FaClock, value: "Quick & Easy", label: "Online Process", tone: "yellow" },
  ];

  const heroChips = [
    { icon: FaFileAlt, title: "Government", subtitle: "Documents", side: "left", position: "one", tone: "orange" },
    { icon: FaDesktop, title: "Online", subtitle: "Applications", side: "left", position: "two", tone: "blue" },
    { icon: FaPlane, title: "Travel &", subtitle: "Ticketing", side: "left", position: "three", tone: "blue" },
    { icon: FaPrint, title: "Printing &", subtitle: "Digital Work", side: "right", position: "four", tone: "blue" },
    { icon: FaUniversity, title: "Financial", subtitle: "Services", side: "right", position: "five", tone: "green" },
    { icon: FaBoxOpen, title: "International", subtitle: "Parcels", side: "right", position: "six", tone: "orange" },
  ];

  return (
    <div className="home-page flex flex-col min-h-full">
      <Seo
        title="Professional Services in Firozepur, Punjab"
        description="Apna Enterprise — Firozepur's trusted multi-service centre for travel ticketing, PAN card, Aadhaar, passport, government forms, printing, finance & international parcels."
        keywords="Apna Enterprise, Firozepur services, PAN card apply, Aadhaar services, passport apply, train ticket booking, air ticket booking, government forms, printing Firozepur, financial services Punjab"
        path="/"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Apna Enterprise",
            "image": "https://apnaenterprise.in/logo.png",
            "url": "https://apnaenterprise.in",
            "telephone": "+918437566186",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Dharamkot Road Jogewala",
              "addressLocality": "Firozepur",
              "addressRegion": "Punjab",
              "postalCode": "142044",
              "addressCountry": "IN"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 30.9279,
              "longitude": 74.6143
            },
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                "opens": "09:00",
                "closes": "20:00"
              }
            ],
            "priceRange": "₹",
            "description": "Firozepur's trusted multi-service centre for travel ticketing, PAN card, Aadhaar, passport, government forms, printing, financial services and international parcels.",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Services",
              "itemListElement": [
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Air Ticket Booking" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Train Ticket Booking" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "PAN Card Apply" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Aadhaar Card Services" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Passport Apply" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Voter Card Apply" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "International Parcel Booking" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Money Transfer (AEPS)" } }
              ]
            },
            "sameAs": []
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Apna Enterprise",
            "url": "https://apnaenterprise.in",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://apnaenterprise.in/services?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }
        ]}
      />

      <section className="home-hero text-white">
        <div className="home-hero__grid" />
        <div className="home-hero__glow home-hero__glow--left" />
        <div className="home-hero__glow home-hero__glow--right" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="home-hero__content">
            <div className="home-hero__copy">
              <p className="home-eyebrow">Your trusted local partner</p>
              <h1 className="home-hero__title">
                Professional Services
                <span>Made Simple</span>
              </h1>
              <p className="home-hero__description">{t.home_hero_desc}</p>

              <div className="home-hero__proof">
                <div className="home-hero__proof-item">
                  <span className="home-hero__proof-icon"><FaBolt /></span>
                  <span><strong>Fast Processing</strong><small>Save your time</small></span>
                </div>
                <div className="home-hero__proof-item">
                  <span className="home-hero__proof-icon home-hero__proof-icon--green"><FaShieldAlt /></span>
                  <span><strong>Reliable Support</strong><small>Always here to help</small></span>
                </div>
                <div className="home-hero__proof-item">
                  <span className="home-hero__proof-icon home-hero__proof-icon--blue"><FaUsers /></span>
                  <span><strong>Thousands</strong><small>of Happy Customers</small></span>
                </div>
              </div>

              <div className="home-hero__actions">
                <Button asChild className="btn-gold home-hero__primary">
                  <Link href="/services">Explore Services <FaArrowRight /></Link>
                </Button>
                <Button asChild className="home-hero__secondary">
                  <Link href="/contact"><FaHeadset /> Contact Us</Link>
                </Button>
              </div>
            </div>

            <div className="home-hero__visual" aria-label="Apna Enterprise service workspace illustration">
              <div className="home-hero__halo" />
              <div className="home-hero__scribble home-hero__scribble--one">Documents<br />Travel<br />Finance<br /><span>And More...</span></div>
              <div className="home-hero__desk-glow" />

              <div className="home-laptop">
                <div className="home-laptop__screen">
                  <div className="home-laptop__screen-top"><span /><span /><span /></div>
                  <div className="home-laptop__screen-content">
                    <img src="/logo.png" alt="" />
                    <strong>Apna Enterprise</strong>
                    <small>Professional Services</small>
                  </div>
                </div>
                <div className="home-laptop__base">
                  <div className="home-laptop__trackpad" />
                </div>
              </div>
              <div className="home-desk-cup"><span /><i /><i /><i /></div>
              <div className="home-desk-mouse" />

              {heroChips.map(({ icon: Icon, title, subtitle, side, position, tone }) => (
                <div key={title} className={`home-float-chip home-float-chip--${side} home-float-chip--${position} home-float-chip--${tone}`}>
                  <span className="home-float-chip__icon"><Icon /></span>
                  <span><strong>{title}</strong><small>{subtitle}</small></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-proof-strip">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="home-proof-grid">
            {proofPoints.map(({ icon: Icon, value, label, tone }, index) => (
              <div className="home-proof-block" key={label}>
                <span className={`home-proof-block__icon home-proof-block__icon--${tone}`}><Icon /></span>
                <span><strong>{value}</strong><small>{label}</small></span>
                {index < proofPoints.length - 1 && <i className="home-proof-divider" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-services">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="home-section-heading">
            <div>
              <p className="home-eyebrow home-eyebrow--gold">Our services</p>
              <h2>A Complete Solution for Your Everyday Needs</h2>
              <p>We offer {totalServices}+ services across {SERVICE_CATEGORIES.length + 1} categories to make your work easier, faster and hassle-free.</p>
            </div>
            <Link href="/services" className="home-section-link">View All Services <FaArrowRight /></Link>
          </div>

          <div className="home-service-grid">
            {SERVICE_CATEGORIES.map((category) => {
              const Icon = CATEGORY_ICONS[category.id] ?? FaIdCard;
              const colors = CATEGORY_COLORS[category.id] ?? CATEGORY_COLORS.documents;
              return (
                <div key={category.id} className="home-service-card">
                  <div className="home-service-card__top">
                    <span className="home-service-card__icon" style={{ background: colors.icon }}><Icon /></span>
                    <div>
                      <h3>{category.name}</h3>
                      <p>{category.services.length} services available</p>
                    </div>
                  </div>
                  <div className="home-service-tags">
                    {category.services.slice(0, 3).map((service) => (
                      <span key={service.id} className={TAG_COLORS[colors.tag] ?? "home-service-tag--blue"}>
                        {service.name.replace(/\s*\(.*\)/, "").replace(" Services", "")}
                      </span>
                    ))}
                  </div>
                  <Link href="/services" className="home-service-card__link">View Services <FaArrowRight /></Link>
                </div>
              );
            })}

            <div className="home-service-card home-service-card--help">
              <div className="home-service-card__top">
                <span className="home-service-card__icon home-service-card__icon--help"><FaHeadset /></span>
                <div><h3>Need Help?</h3><p>Not sure which service you need?</p></div>
              </div>
              <p className="home-service-card__help-copy">Our team is here to guide you.</p>
              <Button asChild className="btn-gold home-service-card__help-button">
                <Link href="/contact">Contact Us <FaArrowRight /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div className="home-cta__pattern" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="home-cta__inner">
            <span className="home-cta__icon"><FaRocket /></span>
            <div className="home-cta__copy">
              <p className="home-eyebrow home-eyebrow--gold">Ready to get started?</p>
              <h2>Let Us Handle the Paperwork</h2>
              <p>Walk in or apply online — our team will guide you through every step.</p>
            </div>
            <div className="home-cta__actions">
              <Button asChild className="btn-gold"><Link href="/apply">Apply Now <FaArrowRight /></Link></Button>
              <Button asChild className="home-hero__secondary"><Link href="/contact"><FaHeadset /> Contact Us</Link></Button>
            </div>
            <div className="home-cta__note">Your Needs<br /><span>Our Support</span></div>
          </div>
        </div>
      </section>
    </div>
  );
}
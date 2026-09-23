import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  FaArrowRight, FaBox, FaClipboardList, FaClock,
  FaFileAlt, FaHeadset, FaLandmark, FaPlane, FaPrint,
  FaShieldAlt, FaUsers, FaChevronRight, FaRupeeSign, FaCheckCircle,
  FaSearch
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";
import { SERVICE_CATEGORIES } from "@/lib/services";
import { useT } from "@/i18n";

// Reusable fixed image slot to handle missing images cleanly
const ImageSlot = ({
  src,
  alt,
  className,
  fit = "contain",
}: {
  src: string;
  alt: string;
  className?: string;
  fit?: "contain" | "cover";
}) => {
  return (
    <div className={`relative overflow-hidden flex items-center justify-center bg-black/5 dark:bg-white/5 ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-${fit} z-10 relative`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement?.classList.add('fallback-visible');
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center border border-dashed border-white/10 opacity-0 [.fallback-visible_&]:opacity-100">
        <img src="/logo.png" alt="" className="h-14 w-14 object-contain opacity-15 grayscale" />
      </div>
    </div>
  );
};

// Leave this empty until the final artwork is provided. Uploading an image later
// only requires setting this path to a file under /public. The artwork fills the
// complete CTA card rather than appearing in a separate image box.
const HOME_CTA_IMAGE_SRC = "";

export default function Home() {
  const { t, lang } = useT();
  const [serviceSearch, setServiceSearch] = useState("");
  const totalServices = SERVICE_CATEGORIES.reduce((total, category) => total + category.services.length, 0);
  const heroPanels = [
    { title: "Government\nDocuments", icon: FaFileAlt, bg: "bg-[#0b1b36]", iconBg: "bg-[#2563eb]" },
    { title: "Travel &\nTicketing", icon: FaPlane, bg: "bg-[#0b1b36]", iconBg: "bg-[#2563eb]" },
    { title: "Online\nApplications", icon: FaClipboardList, bg: "bg-[#0b1b36]", iconBg: "bg-[#10b981]" },
    { title: "Printing &\nDigital Work", icon: FaPrint, bg: "bg-[#0b1b36]", iconBg: "bg-[#a855f7]" },
    { title: "Financial\nServices", icon: FaRupeeSign, bg: "bg-[#0b1b36]", iconBg: "bg-[#f59e0b]" },
    { title: "International\nParcels", icon: FaBox, bg: "bg-[#0b1b36]", iconBg: "bg-[#ea580c]" },
  ];

  const stats = [
    { value: "10,000+", label: "Happy Customers", icon: FaUsers },
    { value: `${totalServices}+`, label: t.home_services_available, icon: FaBox },
    { value: "5+ Years", label: "Trusted Since", icon: FaCheckCircle },
    { value: "Quick & Easy", label: "Online Process", icon: FaClock },
  ];

  const servicesConfig = [
    {
      id: "travel",
      title: "Travel Services",
      count: "3 services available",
      chips: ["Air Ticket", "Train Ticket", "Bus Ticket"],
      bgClass: "bg-[#eef5fc]",
      iconBg: "bg-[#3b82f6]",
      iconColor: "text-white",
      textColor: "text-[#2563eb]",
      chipBg: "bg-white",
      chipText: "text-[#1d4ed8]",
      img: "/assets/services/travel.png",
      icon: FaPlane,
    },
    {
      id: "documents",
      title: "Document Services",
      count: "13 services available",
      chips: ["PAN Card", "Aadhaar Update", "Voter Card"],
      bgClass: "bg-[#f0fdf4]",
      iconBg: "bg-[#10b981]",
      iconColor: "text-white",
      textColor: "text-[#059669]",
      chipBg: "bg-white",
      chipText: "text-[#047857]",
      img: "/assets/services/documents.png",
      icon: FaFileAlt,
    },
    {
      id: "forms",
      title: "Online Form Services",
      count: "6 services available",
      chips: ["Job Forms", "College Admission", "School Forms"],
      bgClass: "bg-[#faf5ff]",
      iconBg: "bg-[#a855f7]",
      iconColor: "text-white",
      textColor: "text-[#7e22ce]",
      chipBg: "bg-white",
      chipText: "text-[#6b21a8]",
      img: "/assets/services/online-forms.png",
      icon: FaClipboardList,
    },
    {
      id: "digital",
      title: "Digital & Print Services",
      count: "3 services available",
      chips: ["Document Scanning", "Printing", "Website Design"],
      bgClass: "bg-[#fff7ed]",
      iconBg: "bg-[#f97316]",
      iconColor: "text-white",
      textColor: "text-[#c2410c]",
      chipBg: "bg-white",
      chipText: "text-[#9a3412]",
      img: "/assets/services/digital-print.png",
      icon: FaPrint,
    },
    {
      id: "financial",
      title: "Financial Services",
      count: "2 services available",
      chips: ["AEPS Payment", "Online Payments"],
      bgClass: "bg-[#fff1f2]",
      iconBg: "bg-[#f43f5e]",
      iconColor: "text-white",
      textColor: "text-[#be123c]",
      chipBg: "bg-white",
      chipText: "text-[#9f1239]",
      img: "/assets/services/financial.png",
      icon: FaLandmark,
    },
    {
      id: "insurance",
      title: "Insurance Services",
      count: "1 service available",
      chips: ["Life Insurance", "Bike Insurance"],
      bgClass: "bg-[#ecfeff]",
      iconBg: "bg-[#0ea5e9]",
      iconColor: "text-white",
      textColor: "text-[#0369a1]",
      chipBg: "bg-white",
      chipText: "text-[#075985]",
      img: "/assets/services/insurance.png",
      icon: FaShieldAlt,
    },
    {
      id: "parcel",
      title: "Parcel Services",
      count: "1 service available",
      chips: ["International Parcel Booking"],
      bgClass: "bg-[#fefce8]",
      iconBg: "bg-[#eab308]",
      iconColor: "text-white",
      textColor: "text-[#a16207]",
      chipBg: "bg-white",
      chipText: "text-[#854d0e]",
      img: "/assets/services/parcel.png",
      icon: FaBox,
    },
  ];

  const serviceCards = useMemo(() => SERVICE_CATEGORIES.map((category) => {
    const visual = servicesConfig.find((item) => item.id === category.id) ?? servicesConfig[0];
    return {
      ...visual,
      title: category.name,
      count: `${category.services.length} ${category.services.length === 1 ? "service" : "services"} available`,
      chips: category.services.slice(0, 3).map((service) =>
        service.name.replace(/\s*\(.*\)/, "").replace(" Services", "")
      ),
    };
  }), []);

  const visibleServiceCards = serviceCards.filter((card) => {
    const query = serviceSearch.trim().toLowerCase();
    return !query || card.title.toLowerCase().includes(query) ||
      card.chips.some((chip) => chip.toLowerCase().includes(query));
  });

  return (
    <div className="home-page-redesign font-sans">
      <Seo
        title="Apna Enterprise | Professional Services"
        description="Firozepur's trusted multi-service centre for travel ticketing, PAN card, Aadhaar, passport, government forms, printing, financial services and international parcels."
      />

      {/* ── HERO SECTION ── */}
      <section
        className="bg-[#030918] relative flex items-center lg:h-[460px] overflow-hidden py-12 lg:py-0"
        style={{
          backgroundImage: "url('/assets/home/hero-office.png')",
          backgroundPosition: "right center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundColor: "#030918",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#030918]/95 via-[#030918]/70 to-[#030918]/20"
        />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 flex flex-col lg:flex-row h-full">
          
          {/* Left Content */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center h-full relative z-20">
            <div className="flex items-center gap-3 mb-4">
               <img src="/logo.png" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" alt="Apna Enterprise Logo" />
               <div>
                 <div className="text-[10px] text-[#FFD700] tracking-widest uppercase font-bold mb-0.5">Welcome To</div>
                 <div className="text-xl font-bold text-white leading-none">Apna Enterprise</div>
               </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-[52px] font-extrabold text-white leading-[1.08] mb-4 tracking-tight">
              Your Everyday<br />
              <span className="text-[#FFD700]">Service Partner</span>
            </h1>
            
            <div className="hidden md:block absolute top-8 right-20 lg:right-[8%] text-3xl font-cursive text-white/80 -rotate-6 whitespace-nowrap">
               Simple Services<br/>Real Support
            </div>
            
            <p className="text-gray-300 text-sm mb-6 max-w-lg leading-relaxed">{t.home_hero_desc}</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/services">
                <Button className="bg-[#FFD700] hover:bg-[#F2C14E] text-black font-bold px-6 py-5 rounded-md text-sm w-full sm:w-auto transition-transform hover:-translate-y-1">
                  {t.home_explore} <FaArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-6 py-5 rounded-md text-sm w-full sm:w-auto transition-colors">
                  {t.home_contact}
                </Button>
              </Link>
            </div>
          </div>
          
           {/* Right Visuals (Desktop only) */}
          <div className="hidden lg:block w-1/2 relative h-full">
             {/* 6 Vertical Panels on far right */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 w-[190px] z-30">
                {heroPanels.map((panel, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-[#0c1a36]/90 border border-white/5 rounded-md py-1.5 px-2.5 hover:bg-[#12264c] transition cursor-pointer shadow-lg relative overflow-hidden group">
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center text-white ${panel.iconBg} shadow-sm`}>
                       <panel.icon className="text-[16px]" />
                     </div>
                     <div className="text-white text-[11px] font-bold leading-tight whitespace-pre-line tracking-wide">{panel.title}</div>
                     <FaChevronRight className="ml-auto text-white/30 text-[10px]" />
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="bg-[#050D24] border-y border-white/10 relative z-20">
        <div className="container mx-auto px-4 lg:px-8 py-3.5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:divide-x divide-white/10">
             {stats.map((stat, idx) => (
               <div key={idx} className="flex items-center justify-center lg:justify-start gap-4 lg:px-8">
                  <stat.icon className="text-[#FFD700] text-2xl shrink-0 drop-shadow-[0_0_6px_rgba(255,215,0,0.4)]" />
                 <div>
                    <div className="text-white font-extrabold text-sm leading-none mb-1">{stat.value}</div>
                   <div className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider font-semibold">{stat.label}</div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES SECTION ── */}
      <section className="bg-white py-9 relative">
        <div className="container mx-auto px-4 lg:px-8">
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-6 gap-5">
             <div>
                <div className="text-[#c18b0a] font-bold text-[10px] tracking-widest uppercase mb-1 flex items-center gap-3">
                  <span className="w-10 h-[2px] bg-[#FFD700]"></span> SERVICES
               </div>
               <h2 className="text-3xl font-extrabold text-[#050D24] mb-1 tracking-tight">Explore Our Services</h2>
               <p className="text-gray-500 text-xs">Choose from {totalServices}+ services across {SERVICE_CATEGORIES.length + 1} categories — all under one roof.</p>
             </div>
             <div className="flex items-center bg-white rounded-lg border border-gray-200 overflow-hidden w-full lg:w-96 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
               <FaSearch className="text-gray-400 ml-5 text-lg" />
               <input
                 type="search"
                 value={serviceSearch}
                 onChange={(event) => setServiceSearch(event.target.value)}
                 placeholder="Search services..."
                 aria-label="Search services"
                 className="flex-1 bg-transparent border-none outline-none px-3 py-2.5 text-xs text-gray-800"
               />
               <button type="button" aria-label="Search services" className="bg-[#FFD700] hover:bg-[#F2C14E] px-4 py-2.5 transition flex items-center justify-center border-l border-gray-200">
                 <FaSearch className="text-black text-lg" />
               </button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
             {visibleServiceCards.map((card) => (
               <div key={card.id} className={`${card.bgClass} rounded-xl p-4 flex flex-col relative h-[190px] overflow-hidden group hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300 border border-black/5`}>
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg ${card.iconBg} ${card.iconColor} flex items-center justify-center mb-2 relative z-10 shadow-sm`}>
                    <card.icon className="text-lg" />
                  </div>
                  
                  {/* Text */}
                  <h3 className="text-sm font-bold text-[#050D24] relative z-10">{card.title}</h3>
                  <p className="text-[10px] text-gray-500 mb-2 relative z-10 font-medium">{card.count}</p>
                  
                  {/* Chips */}
                  <div className="flex flex-wrap gap-1 mb-2 relative z-10 max-w-[90%]">
                    {card.chips.map(chip => (
                      <span key={chip} className={`text-[8px] font-bold ${card.chipBg} ${card.chipText} px-1.5 py-1 rounded shadow-sm border border-black/5 whitespace-nowrap`}>
                        {chip}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto relative z-10 flex items-center justify-between">
                    <Link href="/services" className={`inline-flex items-center text-[10px] font-extrabold ${card.textColor} transition group-hover:underline underline-offset-4 decoration-2`}>
                      View Services <FaArrowRight className="ml-2" />
                    </Link>
                    <Link href="/services" className={`w-8 h-8 rounded-full ${card.iconBg} text-white flex items-center justify-center shadow-md transform group-hover:scale-110 transition`}>
                      <FaArrowRight className="text-xs" />
                    </Link>
                  </div>

                  {/* Image Background */}
                  <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none z-0">
                    <ImageSlot
                      src={card.img}
                      alt={card.title}
                      fit="cover"
                      className="w-full h-full bg-transparent opacity-45 transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/78 via-white/38 to-white/10" />
                  </div>
               </div>
             ))}

             {/* 8th Card: Need Help */}
              <div className="bg-[#f0f9ff] rounded-xl p-4 flex flex-col relative h-[190px] border border-blue-100 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-[#0a1c40] flex items-center justify-center text-white mb-2">
                  <FaHeadset className="text-lg" />
                </div>
                <h3 className="text-sm font-bold text-[#050D24] mb-1">Need Help?</h3>
                <p className="text-[10px] text-gray-600 mb-2 leading-relaxed">
                  Not sure which service you need?<br/>Our team is here to guide you.
                </p>
                <div className="mt-auto relative z-10">
                  <Link href="/contact" className="inline-flex items-center justify-center bg-[#050D24] text-white font-bold px-4 py-2 rounded-md text-[10px] hover:bg-[#0a1c40] transition w-full shadow-md">
                    Contact Us <FaArrowRight className="ml-2" />
                  </Link>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="bg-white pb-4 pt-0">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="bg-[#050D24] rounded-xl p-6 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
            
             {/* Full-card artwork layer; set HOME_CTA_IMAGE_SRC when the final image is uploaded. */}
             {HOME_CTA_IMAGE_SRC && (
               <img
                 src={HOME_CTA_IMAGE_SRC}
                 alt=""
                 aria-hidden="true"
                 className="absolute inset-0 z-0 h-full w-full object-cover opacity-55"
               />
             )}
             <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#050D24]/95 via-[#050D24]/75 to-[#050D24]/45 pointer-events-none" />

            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 relative z-10 w-full lg:w-auto">
              <div className="w-12 h-12 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(255,215,0,0.15)]">
                 <FaFileAlt className="text-[#FFD700] text-2xl" />
              </div>
              <div>
                <div className="text-[#FFD700] font-bold text-xs tracking-widest uppercase mb-3">{t.home_cta_label}</div>
                <h2 className="text-xl md:text-2xl font-extrabold text-white mb-1 tracking-tight">
                  {lang === "en" ? <>Let Us Handle <span className="text-[#FFD700]">the Paperwork</span></> : t.home_cta_title}
                </h2>
                <p className="text-gray-300 text-xs max-w-md">{t.home_cta_desc}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full sm:w-auto">
               <Link href="/apply" className="w-full sm:w-auto">
                  <Button className="bg-[#FFD700] hover:bg-[#F2C14E] text-black font-bold px-6 py-5 rounded-md text-xs w-full shadow-lg transition-transform hover:-translate-y-1">
                    {t.home_apply_now} <FaArrowRight className="ml-2" />
                 </Button>
               </Link>
               <Link href="/contact" className="w-full sm:w-auto">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-6 py-5 rounded-md text-xs w-full transition-colors">
                    <FaHeadset className="mr-2" /> {t.home_contact}
                 </Button>
               </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

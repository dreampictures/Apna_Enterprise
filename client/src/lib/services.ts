export interface ServiceItem {
  id: string;
  name: string;
  description: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  colorClass: string;
  services: ServiceItem[];
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "travel",
    name: "Travel Services",
    colorClass: "bg-blue-50 text-blue-600 border-blue-200",
    services: [
      {
        id: "Air Ticket Booking",
        name: "Air Ticket Booking",
        description: "Domestic and international flight tickets with competitive pricing and dedicated support. Tatkal & group bookings available.",
      },
      {
        id: "Train Ticket Booking",
        name: "Train Ticket Booking",
        description: "Hassle-free IRCTC train reservations across all classes. Tatkal bookings, PNR tracking and cancellation support.",
      },
    ],
  },
  {
    id: "documents",
    name: "Document Services",
    colorClass: "bg-emerald-50 text-emerald-600 border-emerald-200",
    services: [
      {
        id: "PAN Card Apply",
        name: "PAN Card Apply",
        description: "New PAN card applications, corrections, and duplicate card processing through authorised channels.",
      },
      {
        id: "Aadhaar Card Services",
        name: "Aadhaar Card Services (Download/Update)",
        description: "Aadhaar download, address update, mobile number linking, and demographic corrections.",
      },
      {
        id: "Voter Card Apply",
        name: "Voter Card Apply",
        description: "New voter ID registration, name/address correction, and constituency transfers.",
      },
      {
        id: "Passport Apply",
        name: "Passport Apply",
        description: "Fresh passport applications and renewals with guidance on documentation and appointment booking.",
      },
      {
        id: "Learning License",
        name: "Learning License",
        description: "Apply for a learning driving licence with complete form filling and slot booking assistance.",
      },
      {
        id: "Driving License",
        name: "Driving License",
        description: "Permanent driving licence applications, renewals, and address change services.",
      },
      {
        id: "UDID Certificate Apply",
        name: "UDID Certificate Apply",
        description: "Unique Disability ID card applications for persons with disabilities through the UDID portal.",
      },
      {
        id: "E-Shram Card",
        name: "E-Shram Card",
        description: "Registration of unorganised workers on the E-Shram portal for government welfare benefits.",
      },
      {
        id: "Schedule Caste Certificate",
        name: "Schedule Caste Certificate",
        description: "Online application assistance for SC/ST caste certificates issued by the state government.",
      },
      {
        id: "Punjab Resident Certificate",
        name: "Punjab Resident Certificate",
        description: "Apply for a Punjab state residency/domicile certificate for educational and government purposes.",
      },
      {
        id: "Income Certificate",
        name: "Income Certificate",
        description: "Online income certificate applications for scholarships, government schemes, and eligibility proofs.",
      },
      {
        id: "UDYAM Certificate (MSME)",
        name: "UDYAM Certificate (MSME)",
        description: "MSME/UDYAM registration for micro, small, and medium enterprises to avail government benefits.",
      },
      {
        id: "GST Registration",
        name: "GST Registration",
        description: "Goods and Services Tax registration for businesses and self-employed professionals.",
      },
    ],
  },
  {
    id: "forms",
    name: "Online Form Services",
    colorClass: "bg-violet-50 text-violet-600 border-violet-200",
    services: [
      {
        id: "Job Application Forms (Govt Naukri)",
        name: "Job Application Forms (Govt Naukri)",
        description: "Accurate form filling for government job notifications, NRA, SSC, PSSSB, and state-level recruitment.",
      },
      {
        id: "College Admission Forms",
        name: "College Admission Forms",
        description: "Online college admission form filling for universities and professional courses across Punjab & India.",
      },
      {
        id: "School Admission Forms",
        name: "School Admission Forms",
        description: "School admission form assistance for government and private schools.",
      },
      {
        id: "Competitive Exam Forms",
        name: "Competitive Exam Forms",
        description: "Form filling for UPSC, PPSC, banking, railways, and other competitive examinations.",
      },
      {
        id: "Scholarship Forms",
        name: "Scholarship Forms",
        description: "Post-matric, pre-matric, and minority scholarship form assistance on NSP and state portals.",
      },
      {
        id: "General Online Form Filling",
        name: "General Online Form Filling",
        description: "Any other government or private online form filling done accurately and on time.",
      },
    ],
  },
  {
    id: "digital",
    name: "Digital & Print Services",
    colorClass: "bg-amber-50 text-amber-600 border-amber-200",
    services: [
      {
        id: "Document Scanning",
        name: "Document Scanning",
        description: "High-resolution document scanning for government, personal, and professional requirements.",
      },
      {
        id: "Printing Services",
        name: "Printing Services",
        description: "Black & white and colour printing of documents, forms, photos, and certificates.",
      },
      {
        id: "Website Design Services",
        name: "Website Design Services",
        description: "Professional website design for businesses, shops, and individuals at affordable rates.",
      },
    ],
  },
  {
    id: "financial",
    name: "Financial Services",
    colorClass: "bg-rose-50 text-rose-600 border-rose-200",
    services: [
      {
        id: "AEPS (Aadhaar Enabled Payment System)",
        name: "AEPS (Aadhaar Enabled Payment System / ATM)",
        description: "Aadhaar-based cash withdrawal, balance enquiry, and mini statements — no debit card needed.",
      },
      {
        id: "Online Payments",
        name: "Online Payments",
        description: "Utility bill payments, mobile recharge, and other online transactions assisted by our team.",
      },
    ],
  },
  {
    id: "parcel",
    name: "Parcel Services",
    colorClass: "bg-cyan-50 text-cyan-600 border-cyan-200",
    services: [
      {
        id: "International Parcel Booking",
        name: "International Parcel Booking",
        description: "Reliable worldwide parcel and document delivery via top courier networks with real-time tracking.",
      },
    ],
  },
];

export const ALL_SERVICE_IDS = SERVICE_CATEGORIES.flatMap((cat) =>
  cat.services.map((s) => s.id)
) as [string, ...string[]];

export const SERVICE_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  SERVICE_CATEGORIES.flatMap((cat) => cat.services.map((s) => [s.id, cat.name]))
);

export const CATEGORY_NAMES = SERVICE_CATEGORIES.map((c) => c.name);

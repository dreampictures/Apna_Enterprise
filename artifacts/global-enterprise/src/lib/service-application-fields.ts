export type ServiceFieldKind = "text" | "date" | "number" | "textarea" | "select" | "documents";

export interface ServiceFieldOption {
  value: string;
  label: string;
}

export interface ServiceField {
  id: string;
  label: string;
  paLabel?: string;
  kind: ServiceFieldKind;
  required?: boolean;
  placeholder?: string;
  paPlaceholder?: string;
  help?: string;
  paHelp?: string;
  options?: ServiceFieldOption[];
  visibleWhen?: (details: Record<string, unknown>) => boolean;
}

export interface ServiceFormConfig {
  intro: string;
  introPa?: string;
  fields: ServiceField[];
  documents?: string[];
}

const yesNoDocs = ["Aadhaar card copy", "Passport-size photos (2)", "Signature"];
const identityAddressDocs = ["Aadhaar / identity proof", "Address proof", "Passport-size photo"];

export const SERVICE_FORM_CONFIG: Record<string, ServiceFormConfig> = {
  "Air Ticket Booking": {
    intro: "Tell us your route and travel plan. We will check availability and call you with the final fare.",
    fields: [
      { id: "tripType", label: "Trip type", kind: "select", required: true, options: [{ value: "one-way", label: "One way" }, { value: "round-trip", label: "Round trip" }] },
      { id: "from", label: "From", kind: "text", required: true, placeholder: "City or airport" },
      { id: "to", label: "To", kind: "text", required: true, placeholder: "City or airport" },
      { id: "departureDate", label: "Departure date", kind: "date", required: true },
      { id: "returnDate", label: "Return date (if round trip)", kind: "date" },
      { id: "passengers", label: "Passengers", kind: "number", required: true, placeholder: "Number of passengers" },
      { id: "travelClass", label: "Travel class", kind: "select", required: true, options: [{ value: "economy", label: "Economy" }, { value: "premium-economy", label: "Premium economy" }, { value: "business", label: "Business" }] },
    ],
  },
  "Train Ticket Booking": {
    intro: "Share your journey details and preferred class. We will check the best available train and fare.",
    fields: [
      { id: "from", label: "From station", kind: "text", required: true, placeholder: "Boarding station" },
      { id: "to", label: "To station", kind: "text", required: true, placeholder: "Destination station" },
      { id: "journeyDate", label: "Journey date", kind: "date", required: true },
      { id: "passengers", label: "Passengers", kind: "number", required: true, placeholder: "Number of passengers" },
      { id: "travelClass", label: "Preferred class", kind: "select", required: true, options: [{ value: "sleeper", label: "Sleeper" }, { value: "3ac", label: "3 AC" }, { value: "2ac", label: "2 AC" }, { value: "1ac", label: "1 AC" }, { value: "chair-car", label: "Chair car" }] },
    ],
  },
  "Bus Ticket Booking": {
    intro: "Share your bus journey details. We will check availability and contact you with the final fare.",
    introPa: "ਆਪਣੀ ਬੱਸ ਯਾਤਰਾ ਦੀ ਜਾਣਕਾਰੀ ਦਿਓ। ਅਸੀਂ ਉਪਲਬਧਤਾ ਜਾਂਚ ਕੇ ਅੰਤਿਮ ਕਿਰਾਏ ਲਈ ਸੰਪਰਕ ਕਰਾਂਗੇ।",
    fields: [
      { id: "from", label: "From", paLabel: "ਕਿੱਥੋਂ", kind: "text", required: true, placeholder: "Boarding city or stop", paPlaceholder: "ਚੜ੍ਹਨ ਵਾਲਾ ਸ਼ਹਿਰ ਜਾਂ ਸਟਾਪ" },
      { id: "to", label: "To", paLabel: "ਕਿੱਥੇ", kind: "text", required: true, placeholder: "Destination city or stop", paPlaceholder: "ਮੰਜ਼ਿਲ ਸ਼ਹਿਰ ਜਾਂ ਸਟਾਪ" },
      { id: "journeyDate", label: "Journey date", paLabel: "ਯਾਤਰਾ ਦੀ ਤਾਰੀਖ", kind: "date", required: true },
      { id: "passengers", label: "Passengers", paLabel: "ਯਾਤਰੀ", kind: "number", required: true, placeholder: "Number of passengers", paPlaceholder: "ਯਾਤਰੀਆਂ ਦੀ ਗਿਣਤੀ" },
      { id: "busType", label: "Preferred bus type", paLabel: "ਪਸੰਦੀਦਾ ਬੱਸ ਕਿਸਮ", kind: "select", required: true, options: [{ value: "any", label: "Any available bus" }, { value: "ordinary", label: "Ordinary" }, { value: "ac", label: "AC" }, { value: "volvo", label: "Volvo / premium" }] },
    ],
  },
  "International Parcel Booking": {
    intro: "Give us the pickup, destination and parcel information so we can check courier options and pricing.",
    fields: [
      { id: "pickupAddress", label: "Pickup city / address", kind: "text", required: true, placeholder: "Where should we collect the parcel?" },
      { id: "destination", label: "Destination country / city", kind: "text", required: true, placeholder: "Where is it going?" },
      { id: "parcelType", label: "Parcel type", kind: "select", required: true, options: [{ value: "documents", label: "Documents" }, { value: "personal-items", label: "Personal items" }, { value: "commercial-goods", label: "Commercial goods" }] },
      { id: "weight", label: "Approximate weight (kg)", kind: "number", required: true, placeholder: "e.g. 2" },
      { id: "parcelNotes", label: "Parcel description", kind: "textarea", placeholder: "What is inside the parcel?" },
    ],
  },
  "PAN Card Apply": {
    intro: "Please share the PAN request type and confirm which required documents are ready. We will review and call you with the price.",
    fields: [
      { id: "requestType", label: "PAN request", kind: "select", required: true, options: [{ value: "new", label: "New PAN card" }, { value: "correction", label: "Correction / update" }, { value: "reprint", label: "Reprint / duplicate" }] },
      { id: "dateOfBirth", label: "Date of birth", kind: "date", required: true },
      { id: "aadhaarNumber", label: "Aadhaar number", kind: "text", required: true, placeholder: "12-digit Aadhaar number" },
      { id: "aadhaarLinkedMobile", label: "Mobile number linked with Aadhaar", kind: "text", required: true, placeholder: "Aadhaar-linked mobile number" },
      { id: "documents", label: "Documents available", kind: "documents", required: true, options: yesNoDocs.map((value) => ({ value, label: value })) },
      { id: "birthProofType", label: "Age / birth proof", kind: "select", required: true, options: [{ value: "10th-certificate", label: "10th certificate" }, { value: "birth-certificate", label: "Birth certificate / birth proof" }] },
    ],
    documents: ["Aadhaar card", "Aadhaar-linked mobile number", "10th certificate or birth proof", "Two passport-size photos", "Signature"],
  },
  "Aadhaar Card Services": {
    intro: "Choose the Aadhaar service and share the linked mobile number so our team can guide you correctly.",
    fields: [
      { id: "requestType", label: "Aadhaar service", kind: "select", required: true, options: [{ value: "download", label: "Download / print" }, { value: "address-update", label: "Address update" }, { value: "mobile-link", label: "Mobile number linking" }, { value: "details-correction", label: "Details correction" }] },
      { id: "aadhaarNumber", label: "Aadhaar number / enrolment ID", kind: "text", required: true, placeholder: "Enter Aadhaar number or enrolment ID" },
      { id: "linkedMobile", label: "Mobile number linked with Aadhaar", kind: "text", required: true, placeholder: "Aadhaar-linked mobile number" },
      { id: "address", label: "Current address (for address update)", kind: "textarea", placeholder: "Enter the address to be updated" },
      { id: "documents", label: "Documents available", kind: "documents", options: identityAddressDocs.map((value) => ({ value, label: value })) },
    ],
    documents: ["Aadhaar card / enrolment ID", "Aadhaar-linked mobile number", "Address proof (for address update)"],
  },
  "Voter Card Apply": {
    intro: "Choose the voter ID request type and share your basic details and available proofs.",
    fields: [
      { id: "requestType", label: "Voter ID request", kind: "select", required: true, options: [{ value: "new", label: "New voter ID" }, { value: "correction", label: "Correction / update" }, { value: "transfer", label: "Transfer constituency / address" }] },
      { id: "dateOfBirth", label: "Date of birth", kind: "date", required: true },
      { id: "address", label: "Residential address", kind: "textarea", required: true, placeholder: "Full current address" },
      { id: "documents", label: "Documents available", kind: "documents", required: true, options: [{ value: "identity-proof", label: "Aadhaar / identity proof" }, { value: "address-proof", label: "Address proof" }, { value: "age-proof", label: "10th certificate or birth proof" }, { value: "photo", label: "Passport-size photo" } ] },
    ],
    documents: ["Aadhaar / identity proof", "Address proof", "10th certificate or birth proof", "Passport-size photo"],
  },
  "Passport Apply": {
    intro: "Share the passport request type and basic details. We will review the required documents before calling you.",
    fields: [
      { id: "requestType", label: "Passport request", kind: "select", required: true, options: [{ value: "fresh", label: "Fresh passport" }, { value: "renewal", label: "Renewal" }] },
      { id: "dateOfBirth", label: "Date of birth", kind: "date", required: true },
      { id: "address", label: "Current address", kind: "textarea", required: true, placeholder: "Full current address" },
      { id: "documents", label: "Documents available", kind: "documents", options: identityAddressDocs.map((value) => ({ value, label: value })) },
    ],
    documents: ["Aadhaar / identity proof", "Address proof", "Passport-size photos"],
  },
  "Learning License": {
    intro: "Tell us the vehicle category and your basic details for learning licence assistance.",
    fields: [
      { id: "vehicleType", label: "Vehicle category", kind: "select", required: true, options: [{ value: "two-wheeler", label: "Two-wheeler" }, { value: "four-wheeler", label: "Four-wheeler" }, { value: "both", label: "Both" }] },
      { id: "dateOfBirth", label: "Date of birth", kind: "date", required: true },
      { id: "address", label: "Residential address", kind: "textarea", required: true, placeholder: "Full current address" },
      { id: "documents", label: "Documents available", kind: "documents", options: identityAddressDocs.map((value) => ({ value, label: value })) },
    ],
    documents: ["Aadhaar / identity proof", "Address proof", "Passport-size photo"],
  },
  "Driving License": {
    intro: "Choose the licence service and share the existing licence details if applicable.",
    fields: [
      { id: "requestType", label: "Driving licence service", kind: "select", required: true, options: [{ value: "new", label: "New permanent licence" }, { value: "renewal", label: "Renewal" }, { value: "address-change", label: "Address change" }, { value: "duplicate", label: "Duplicate licence" }] },
      { id: "licenseNumber", label: "Existing licence number (if any)", kind: "text", placeholder: "Enter licence number" },
      { id: "vehicleType", label: "Vehicle category", kind: "select", required: true, options: [{ value: "two-wheeler", label: "Two-wheeler" }, { value: "four-wheeler", label: "Four-wheeler" }, { value: "both", label: "Both" }] },
      { id: "documents", label: "Documents available", kind: "documents", options: identityAddressDocs.map((value) => ({ value, label: value })) },
    ],
    documents: ["Aadhaar / identity proof", "Address proof", "Existing licence (for renewal/correction)"],
  },
  "UDID Certificate Apply": {
    intro: "Share the disability certificate application details and any available supporting documents.",
    fields: [
      { id: "disabilityType", label: "Disability category", kind: "text", required: true, placeholder: "Enter category" },
      { id: "address", label: "Residential address", kind: "textarea", required: true, placeholder: "Full current address" },
      { id: "documents", label: "Documents available", kind: "documents", options: identityAddressDocs.map((value) => ({ value, label: value })) },
    ],
    documents: ["Aadhaar / identity proof", "Address proof", "Medical / disability certificate", "Passport-size photo"],
  },
  "E-Shram Card": {
    intro: "Share your Aadhaar-linked contact and work details for E-Shram registration.",
    fields: [
      { id: "aadhaarNumber", label: "Aadhaar number", kind: "text", required: true, placeholder: "12-digit Aadhaar number" },
      { id: "aadhaarLinkedMobile", label: "Mobile number linked with Aadhaar", kind: "text", required: true, placeholder: "Aadhaar-linked mobile number" },
      { id: "occupation", label: "Occupation / work", kind: "text", required: true, placeholder: "What work do you do?" },
      { id: "address", label: "Current address", kind: "textarea", required: true, placeholder: "Full current address" },
      { id: "documents", label: "Documents available", kind: "documents", options: [{ value: "aadhaar", label: "Aadhaar card" }, { value: "mobile", label: "Aadhaar-linked mobile" }, { value: "photo", label: "Passport-size photo" }] },
    ],
    documents: ["Aadhaar card", "Aadhaar-linked mobile number", "Passport-size photo"],
  },
  "Schedule Caste Certificate": {
    intro: "Share the certificate details and supporting proofs available with you.",
    fields: [
      { id: "category", label: "Caste category", kind: "text", required: true, placeholder: "Enter category" },
      { id: "address", label: "Residential address", kind: "textarea", required: true, placeholder: "Full current address" },
      { id: "documents", label: "Documents available", kind: "documents", options: identityAddressDocs.map((value) => ({ value, label: value })) },
    ],
    documents: ["Aadhaar / identity proof", "Address proof", "Family / caste proof if available"],
  },
  "Punjab Resident Certificate": {
    intro: "Share your Punjab address and the proofs available for the resident certificate.",
    fields: [
      { id: "address", label: "Punjab residential address", kind: "textarea", required: true, placeholder: "Full address in Punjab" },
      { id: "yearsAtAddress", label: "Years at current address", kind: "number", required: true, placeholder: "Number of years" },
      { id: "documents", label: "Documents available", kind: "documents", options: identityAddressDocs.map((value) => ({ value, label: value })) },
    ],
    documents: ["Aadhaar / identity proof", "Punjab address proof", "Passport-size photo"],
  },
  "Income Certificate": {
    intro: "Share your income details and the documents available for verification.",
    fields: [
      { id: "annualIncome", label: "Approximate annual family income", kind: "number", required: true, placeholder: "Amount in rupees" },
      { id: "occupation", label: "Occupation", kind: "text", required: true, placeholder: "Enter occupation" },
      { id: "address", label: "Residential address", kind: "textarea", required: true, placeholder: "Full current address" },
      { id: "documents", label: "Documents available", kind: "documents", options: identityAddressDocs.map((value) => ({ value, label: value })) },
    ],
    documents: ["Aadhaar / identity proof", "Address proof", "Income / self-declaration proof"],
  },
  "UDYAM Certificate (MSME)": {
    intro: "Share your business details so we can prepare the UDYAM registration request.",
    fields: [
      { id: "businessName", label: "Business name", kind: "text", required: true, placeholder: "Registered or proposed name" },
      { id: "businessType", label: "Business type", kind: "select", required: true, options: [{ value: "proprietorship", label: "Proprietorship" }, { value: "partnership", label: "Partnership" }, { value: "company", label: "Company" }, { value: "other", label: "Other" }] },
      { id: "businessAddress", label: "Business address", kind: "textarea", required: true, placeholder: "Full business address" },
      { id: "documents", label: "Documents available", kind: "documents", options: [{ value: "aadhaar", label: "Owner Aadhaar" }, { value: "pan", label: "PAN card" }, { value: "bank", label: "Bank details" }] },
    ],
    documents: ["Owner Aadhaar card", "PAN card", "Business / bank details"],
  },
  "GST Registration": {
    intro: "Share the business information needed for GST registration review.",
    fields: [
      { id: "businessName", label: "Business / legal name", kind: "text", required: true, placeholder: "Business name" },
      { id: "businessType", label: "Business type", kind: "select", required: true, options: [{ value: "proprietorship", label: "Proprietorship" }, { value: "partnership", label: "Partnership" }, { value: "company", label: "Company" }, { value: "other", label: "Other" }] },
      { id: "businessAddress", label: "Business address", kind: "textarea", required: true, placeholder: "Full business address" },
      { id: "documents", label: "Documents available", kind: "documents", options: [{ value: "pan", label: "PAN card" }, { value: "aadhaar", label: "Promoter Aadhaar" }, { value: "address", label: "Business address proof" }] },
    ],
    documents: ["PAN card", "Promoter Aadhaar", "Business address proof", "Bank details"],
  },
  "Job Application Forms (Govt Naukri)": {
    intro: "Tell us which recruitment form you need help with and share the deadline.",
    fields: [
      { id: "formName", label: "Job / recruitment name", kind: "text", required: true, placeholder: "e.g. SSC, PSSSB, Punjab Police" },
      { id: "lastDate", label: "Last date (if known)", kind: "date" },
      { id: "qualification", label: "Highest qualification", kind: "text", required: true, placeholder: "Enter qualification" },
      { id: "documents", label: "Documents available", kind: "documents", options: [{ value: "photo", label: "Passport-size photo" }, { value: "signature", label: "Signature scan" }, { value: "id", label: "Identity proof" }, { value: "certificates", label: "Qualification certificates" }] },
    ],
    documents: ["Passport-size photo", "Signature scan", "Identity proof", "Qualification certificates"],
  },
  "College Admission Forms": {
    intro: "Share the college/course and your qualification details for form-filling assistance.",
    fields: [
      { id: "college", label: "College / university", kind: "text", required: true, placeholder: "College or university name" },
      { id: "course", label: "Course", kind: "text", required: true, placeholder: "Course name" },
      { id: "qualification", label: "Latest qualification", kind: "text", required: true, placeholder: "Enter qualification" },
      { id: "documents", label: "Documents available", kind: "documents", options: [{ value: "photo", label: "Passport-size photo" }, { value: "id", label: "Identity proof" }, { value: "marksheets", label: "Mark sheets / certificates" }] },
    ],
    documents: ["Passport-size photo", "Identity proof", "Mark sheets / certificates"],
  },
  "School Admission Forms": {
    intro: "Share the school and student details needed for admission form assistance.",
    fields: [
      { id: "school", label: "School name", kind: "text", required: true, placeholder: "School name" },
      { id: "studentClass", label: "Class for admission", kind: "text", required: true, placeholder: "e.g. Class 8" },
      { id: "documents", label: "Documents available", kind: "documents", options: [{ value: "birth-proof", label: "Birth proof" }, { value: "address", label: "Address proof" }, { value: "photo", label: "Student photos" }] },
    ],
    documents: ["Birth proof", "Address proof", "Student passport-size photos"],
  },
  "Competitive Exam Forms": {
    intro: "Tell us the exam and share the deadline and qualification details.",
    fields: [
      { id: "examName", label: "Exam name", kind: "text", required: true, placeholder: "e.g. UPSC, PPSC, Banking" },
      { id: "lastDate", label: "Last date (if known)", kind: "date" },
      { id: "qualification", label: "Qualification", kind: "text", required: true, placeholder: "Enter qualification" },
      { id: "documents", label: "Documents available", kind: "documents", options: [{ value: "photo", label: "Passport-size photo" }, { value: "signature", label: "Signature scan" }, { value: "id", label: "Identity proof" }] },
    ],
    documents: ["Passport-size photo", "Signature scan", "Identity proof"],
  },
  "Scholarship Forms": {
    intro: "Share the scholarship name and student details for eligibility and form assistance.",
    fields: [
      { id: "scholarshipName", label: "Scholarship name", kind: "text", required: true, placeholder: "Scholarship / portal name" },
      { id: "studentClass", label: "Class / course", kind: "text", required: true, placeholder: "Current class or course" },
      { id: "income", label: "Approximate family income", kind: "number", placeholder: "Amount in rupees" },
      { id: "documents", label: "Documents available", kind: "documents", options: [{ value: "id", label: "Identity proof" }, { value: "marksheets", label: "Mark sheet" }, { value: "income", label: "Income certificate" }, { value: "bank", label: "Bank details" }] },
    ],
    documents: ["Identity proof", "Mark sheet", "Income certificate", "Bank details"],
  },
  "General Online Form Filling": {
    intro: "Tell us which form you need help with and our team will call you after review.",
    fields: [
      { id: "formName", label: "Form / website name", kind: "text", required: true, placeholder: "Which form do you need?" },
      { id: "requirement", label: "What do you need done?", kind: "textarea", required: true, placeholder: "Briefly describe your requirement" },
      { id: "deadline", label: "Deadline (if any)", kind: "date" },
    ],
  },
  "Document Scanning": {
    intro: "Tell us what needs scanning and approximately how many pages.",
    fields: [
      { id: "documentType", label: "Document type", kind: "text", required: true, placeholder: "Certificates, forms, IDs, etc." },
      { id: "pages", label: "Approximate pages", kind: "number", required: true, placeholder: "Number of pages" },
      { id: "quality", label: "Required quality", kind: "select", options: [{ value: "standard", label: "Standard PDF" }, { value: "high", label: "High resolution" }] },
    ],
  },
  "Printing Services": {
    intro: "Share the print type and quantity so we can confirm the final cost.",
    fields: [
      { id: "printType", label: "Print type", kind: "select", required: true, options: [{ value: "black-white", label: "Black & white" }, { value: "colour", label: "Colour" }, { value: "photos", label: "Photos" }] },
      { id: "pages", label: "Approximate pages / copies", kind: "number", required: true, placeholder: "Quantity" },
      { id: "notes", label: "Paper / size details", kind: "textarea", placeholder: "A4, legal, glossy, binding, etc." },
    ],
  },
  "Website Design Services": {
    intro: "Tell us about your business and the website you need.",
    fields: [
      { id: "businessName", label: "Business / brand name", kind: "text", required: true, placeholder: "Your business name" },
      { id: "websiteType", label: "Website type", kind: "select", required: true, options: [{ value: "business", label: "Business website" }, { value: "ecommerce", label: "Online store" }, { value: "portfolio", label: "Portfolio / personal" }, { value: "other", label: "Other" }] },
      { id: "requirements", label: "Website requirements", kind: "textarea", required: true, placeholder: "Pages, features, references, etc." },
    ],
  },
  "AEPS (Aadhaar Enabled Payment System)": {
    intro: "Tell us the AEPS service you need. This service is completed in person at the centre.",
    fields: [
      { id: "requestType", label: "AEPS service", kind: "select", required: true, options: [{ value: "cash-withdrawal", label: "Cash withdrawal" }, { value: "balance-enquiry", label: "Balance enquiry" }, { value: "mini-statement", label: "Mini statement" }] },
      { id: "bank", label: "Bank name", kind: "text", required: true, placeholder: "Your bank" },
    ],
  },
  "Online Payments": {
    intro: "Tell us which payment or recharge you need. This service is completed in person at the centre.",
    fields: [
      { id: "paymentType", label: "Payment type", kind: "select", required: true, options: [{ value: "bill-payment", label: "Utility bill" }, { value: "mobile-recharge", label: "Mobile recharge" }, { value: "other", label: "Other online payment" }] },
      { id: "provider", label: "Provider / biller", kind: "text", required: true, placeholder: "Electricity board, mobile operator, etc." },
    ],
  },
  "Insurance Services": {
    intro: "Choose the insurance cover you need. A valid RC Number is required for every car or bike insurance request so we can check the correct quotation.",
    introPa: "ਲੋੜੀਂਦੀ ਬੀਮਾ ਸੇਵਾ ਚੁਣੋ। ਸਹੀ ਕੋਟੇਸ਼ਨ ਲਈ ਹਰ ਕਾਰ ਜਾਂ ਬਾਈਕ ਬੀਮਾ ਬੇਨਤੀ ਵਿੱਚ RC ਨੰਬਰ ਲਾਜ਼ਮੀ ਹੈ।",
    fields: [
      {
        id: "insuranceType",
        label: "Insurance type",
        paLabel: "ਬੀਮਾ ਕਿਸਮ",
        kind: "select",
        required: true,
        options: [
          { value: "Car Insurance - Comprehensive", label: "Car Insurance — Comprehensive" },
          { value: "Car Insurance - Third Party", label: "Car Insurance — Third Party" },
          { value: "Bike Insurance - Comprehensive", label: "Bike Insurance — Comprehensive" },
          { value: "Bike Insurance - Third Party", label: "Bike Insurance — Third Party" },
          { value: "Health Insurance", label: "Health Insurance" },
        ],
      },
      {
        id: "rcNumber",
        label: "RC Number",
        paLabel: "RC ਨੰਬਰ",
        kind: "text",
        placeholder: "Enter vehicle RC number",
        paPlaceholder: "ਵਾਹਨ ਦਾ RC ਨੰਬਰ ਦਰਜ ਕਰੋ",
        help: "Required for car and bike insurance.",
        paHelp: "ਕਾਰ ਅਤੇ ਬਾਈਕ ਬੀਮੇ ਲਈ ਲਾਜ਼ਮੀ।",
        visibleWhen: (details) => String(details.insuranceType ?? "").startsWith("Car Insurance") || String(details.insuranceType ?? "").startsWith("Bike Insurance"),
      },
      {
        id: "policyExpiry",
        label: "Existing policy expiry date (if renewing)",
        paLabel: "ਮੌਜੂਦਾ ਪਾਲਿਸੀ ਦੀ ਮਿਆਦ (ਜੇ renewal ਹੈ)",
        kind: "date",
        visibleWhen: (details) => String(details.insuranceType ?? "").startsWith("Car Insurance") || String(details.insuranceType ?? "").startsWith("Bike Insurance"),
      },
      {
        id: "healthCover",
        label: "Health cover type",
        paLabel: "ਹੈਲਥ ਕਵਰ ਕਿਸਮ",
        kind: "select",
        required: true,
        options: [
          { value: "individual", label: "Individual" },
          { value: "family", label: "Family floater" },
          { value: "senior-citizen", label: "Senior citizen" },
        ],
        visibleWhen: (details) => details.insuranceType === "Health Insurance",
      },
      {
        id: "members",
        label: "Number of people to cover",
        paLabel: "ਕਵਰ ਕੀਤੇ ਜਾਣ ਵਾਲੇ ਲੋਕਾਂ ਦੀ ਗਿਣਤੀ",
        kind: "number",
        required: true,
        placeholder: "e.g. 1",
        visibleWhen: (details) => details.insuranceType === "Health Insurance",
      },
    ],
  },
};

export function getServiceFormConfig(service: string | undefined): ServiceFormConfig {
  return SERVICE_FORM_CONFIG[service ?? ""] ?? {
    intro: "Share a few details so our team can review your request and call you with the price.",
    fields: [
      { id: "requirement", label: "Requirement details", kind: "textarea", required: true, placeholder: "Tell us what you need help with" },
    ],
  };
}
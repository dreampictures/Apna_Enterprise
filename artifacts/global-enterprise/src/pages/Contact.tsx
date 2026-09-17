import { useState } from "react";
import { 
  FaMapMarkerAlt, FaClock, FaEnvelope, FaPhoneAlt, 
  FaHeadset, FaUsers, FaShieldAlt, FaCopy, FaLocationArrow,
  FaCheckCircle, FaExclamationCircle, FaCommentDots, FaPaperPlane,
  FaStar
} from "react-icons/fa";
import { Link } from "wouter";
import Seo from "@/components/Seo";
import { useT } from "@/i18n";

export default function Contact() {
  const { t } = useT();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could use a toast here
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.subject.trim()) newErrors.subject = "Please select a subject";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    else if (formData.message.length < 10) newErrors.message = "Message is too short";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setStatus("submitting");
    
    try {
      const res = await fetch("/api/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error("Failed to submit");
      
      setStatus("success");
      setFormData({ fullName: "", email: "", phone: "", subject: "", message: "" });
      
      // Auto reset success message after 5 seconds
      setTimeout(() => {
        if (status === "success") setStatus("idle");
      }, 5000);
      
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#f8fafc" }}>
      <Seo
        title="Contact Us — Reach Apna Enterprise in Firozepur"
        description="Get in touch with Apna Enterprise, Firozepur. Email us or fill the application form. We're here to help with all your service needs."
        keywords="contact Apna Enterprise, Firozepur service centre address, email Apna Enterprise"
        path="/contact"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://apnaenterprise.in/" },
            { "@type": "ListItem", "position": 2, "name": "Contact Us", "item": "https://apnaenterprise.in/contact" }
          ]
        }}
      />
      
      {/* ── Contact Hero ── */}
      <section className="contact-hero pt-14 pb-20 px-4">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
            
            {/* Left Copy */}
            <div className="text-white max-w-xl text-center lg:text-left">
              <p className="text-[#f4c24b] text-xs font-bold uppercase tracking-[0.2em] mb-3">
                WE'RE HERE FOR YOU
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 tracking-tight">
                Contact Us
              </h1>
              <p className="text-[0.95rem] leading-relaxed text-blue-100/80 max-w-md mx-auto lg:mx-0">
                Have a question, need support, or want to work with us? We're just a message away.
              </p>
            </div>
            
            {/* Right Features */}
            <div className="flex flex-wrap lg:flex-nowrap justify-center gap-8 lg:gap-12">
              <div className="contact-hero-feature">
                <div className="contact-hero-feature-icon">
                  <FaHeadset />
                </div>
                <div>
                  <div className="contact-hero-feature-title">Quick Response</div>
                  <div className="contact-hero-feature-desc">We usually reply<br/>within 24 hours</div>
                </div>
              </div>
              <div className="contact-hero-feature">
                <div className="contact-hero-feature-icon">
                  <FaUsers />
                </div>
                <div>
                  <div className="contact-hero-feature-title">Dedicated Support</div>
                  <div className="contact-hero-feature-desc">Real people,<br/>real solutions</div>
                </div>
              </div>
              <div className="contact-hero-feature">
                <div className="contact-hero-feature-icon">
                  <FaShieldAlt />
                </div>
                <div>
                  <div className="contact-hero-feature-title">Trusted & Secure</div>
                  <div className="contact-hero-feature-desc">Your information<br/>is always safe</div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ── Main Layout ── */}
      <section className="py-12 px-4 -mt-10 relative z-20">
        <div className="container mx-auto max-w-6xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* ── Left Column: Contact Info ── */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              <div className="contact-card-white p-6 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-800">
                    <FaShieldAlt />
                  </div>
                  <h2 className="font-bold text-gray-800">Our Contact Information</h2>
                </div>
                <p className="text-xs text-gray-500 mb-8">Feel free to reach us through any of the following.</p>
                
                <div className="space-y-6">
                  {/* Email */}
                  <div className="contact-info-item">
                    <div className="contact-info-icon">
                      <FaEnvelope />
                    </div>
                    <div className="flex-1">
                      <div className="text-[0.65rem] text-gray-400 uppercase font-bold tracking-wider mb-1">Email</div>
                      <a href="mailto:info@apnaenterprise.in" className="text-sm font-semibold text-gray-800 hover:text-[#d4a017] transition-colors block mb-1">
                        info@apnaenterprise.in
                      </a>
                      <div className="text-[0.65rem] text-gray-500">We'll get back to you soon.</div>
                    </div>
                    <button onClick={() => handleCopy("info@apnaenterprise.in")} className="text-gray-400 hover:text-gray-700 p-1">
                      <FaCopy className="text-xs" />
                    </button>
                  </div>
                  
                  {/* Phone */}
                  <div className="contact-info-item">
                    <div className="contact-info-icon">
                      <FaPhoneAlt />
                    </div>
                    <div className="flex-1">
                      <div className="text-[0.65rem] text-gray-400 uppercase font-bold tracking-wider mb-1">Phone</div>
                      <a href="tel:+918437566186" className="text-sm font-semibold text-gray-800 hover:text-[#d4a017] transition-colors block mb-1">
                        +91 84375 66186
                      </a>
                      <div className="text-[0.65rem] text-gray-500">Mon - Sat, 9:00 AM - 7:00 PM</div>
                    </div>
                    <button onClick={() => handleCopy("+918437566186")} className="text-gray-400 hover:text-gray-700 p-1">
                      <FaCopy className="text-xs" />
                    </button>
                  </div>
                  
                  {/* Address */}
                  <div className="contact-info-item">
                    <div className="contact-info-icon">
                      <FaMapMarkerAlt />
                    </div>
                    <div className="flex-1">
                      <div className="text-[0.65rem] text-gray-400 uppercase font-bold tracking-wider mb-1">Address</div>
                      <div className="text-sm font-semibold text-gray-800 leading-snug mb-1">
                        Apna Enterprise,<br/>Dharamkot Road Jogewala,<br/>Firozepur, Punjab - 142044
                      </div>
                    </div>
                    <button onClick={() => handleCopy("Apna Enterprise, Dharamkot Road Jogewala, Firozepur, Punjab - 142044")} className="text-gray-400 hover:text-gray-700 p-1">
                      <FaCopy className="text-xs" />
                    </button>
                  </div>
                  
                  {/* Hours */}
                  <div className="contact-info-item">
                    <div className="contact-info-icon">
                      <FaClock />
                    </div>
                    <div className="flex-1">
                      <div className="text-[0.65rem] text-gray-400 uppercase font-bold tracking-wider mb-1">Working Hours</div>
                      <div className="text-sm font-semibold text-gray-800 mb-1">Mon - Sat: 9:00 AM - 7:00 PM</div>
                      <div className="text-[0.65rem] text-gray-500">Sundays & Public Holidays: Closed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* ── Center Column: Form ── */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div className="contact-card-white p-6 md:p-8 h-full">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md">
                    <FaPaperPlane />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Send Us a Message</h2>
                </div>
                <p className="text-xs text-gray-500 mb-8">Fill out the form below and we'll get back to you as soon as possible.</p>
                
                {status === "success" ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                      <FaCheckCircle />
                    </div>
                    <h3 className="font-bold text-green-800 mb-2">Message Sent Successfully</h3>
                    <p className="text-sm text-green-700 mb-6">Thank you for contacting Apna Enterprise. Our team will get back to you soon.</p>
                    <button 
                      onClick={() => setStatus("idle")}
                      className="text-xs font-bold bg-white text-green-700 border border-green-200 px-4 py-2 rounded-md hover:bg-green-50 transition"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {status === "error" && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-center gap-2">
                        <FaExclamationCircle className="flex-shrink-0" />
                        Something went wrong while sending your message. Please try again or call us directly.
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="contact-label">Full Name <span>*</span></label>
                        <input 
                          type="text" 
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Enter your full name" 
                          className="contact-input"
                          disabled={status === "submitting"}
                        />
                        {errors.fullName && <div className="contact-error">{errors.fullName}</div>}
                      </div>
                      <div>
                        <label className="contact-label">Email Address <span>*</span></label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email address" 
                          className="contact-input"
                          disabled={status === "submitting"}
                        />
                        {errors.email && <div className="contact-error">{errors.email}</div>}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="contact-label">Phone Number</label>
                        <input 
                          type="text" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Enter your phone number" 
                          className="contact-input"
                          disabled={status === "submitting"}
                        />
                      </div>
                      <div>
                        <label className="contact-label">Subject <span>*</span></label>
                        <div className="relative">
                          <select 
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="contact-input appearance-none bg-white"
                            disabled={status === "submitting"}
                          >
                            <option value="">Select a subject</option>
                            <option value="General Inquiry">General Inquiry</option>
                            <option value="Service Support">Service Support</option>
                            <option value="Application Status">Application Status</option>
                            <option value="Feedback/Complaint">Feedback/Complaint</option>
                            <option value="Other">Other</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                          </div>
                        </div>
                        {errors.subject && <div className="contact-error">{errors.subject}</div>}
                      </div>
                    </div>
                    
                    <div>
                      <label className="contact-label">Your Message <span>*</span></label>
                      <textarea 
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help you..." 
                        rows={4}
                        className="contact-input resize-none"
                        disabled={status === "submitting"}
                      ></textarea>
                      <div className="flex justify-between items-center mt-1">
                        {errors.message ? <div className="contact-error m-0">{errors.message}</div> : <div></div>}
                        <div className="text-[0.65rem] text-gray-400 text-right">{formData.message.length}/500</div>
                      </div>
                    </div>
                    
                    <button 
                      type="submit" 
                      className="contact-btn-submit"
                      disabled={status === "submitting"}
                    >
                      {status === "submitting" ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-[#1a1200]/20 border-t-[#1a1200] rounded-full animate-spin"></span> Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <FaPaperPlane className="text-sm" /> Send Message
                        </span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
            
            {/* ── Right Column: Map ── */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              <div className="contact-card-white p-4 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4 px-2 pt-2">
                  <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center">
                    <FaMapMarkerAlt />
                  </div>
                  <h2 className="font-bold text-gray-800 text-sm">Find Us Here</h2>
                </div>
                <p className="text-[0.65rem] text-gray-500 mb-4 px-2">Visit us at our office or get directions using the map below.</p>
                
                <div className="flex-1 rounded-lg overflow-hidden border border-gray-200 mb-4 relative min-h-[220px]">
                  <iframe
                    title="Apna Enterprise Location"
                    src="https://maps.google.com/maps?q=31.105486,75.0642315&z=17&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0, position: "absolute", inset: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=31.105486,75.0642315"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#0f214f] hover:bg-[#1a3675] text-white text-xs font-bold rounded-md py-3 px-4 flex items-center justify-center gap-2 transition-colors"
                >
                  <FaLocationArrow /> Get Directions
                </a>
              </div>
            </div>
            
          </div>
          
          {/* ── Support Features Row ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="contact-support-card">
              <div className="contact-support-icon bg-blue-50 text-blue-500">
                <FaCommentDots />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-800">Quick Response</div>
                <div className="text-[0.65rem] text-gray-500">We usually reply within 24 hours</div>
              </div>
            </div>
            <div className="contact-support-card">
              <div className="contact-support-icon bg-green-50 text-green-500">
                <FaShieldAlt />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-800">Secure Communication</div>
                <div className="text-[0.65rem] text-gray-500">Your information is always safe</div>
              </div>
            </div>
            <div className="contact-support-card">
              <div className="contact-support-icon bg-purple-50 text-purple-500">
                <FaUsers />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-800">Dedicated Support</div>
                <div className="text-[0.65rem] text-gray-500">We are always here to help you</div>
              </div>
            </div>
            <div className="contact-support-card">
              <div className="contact-support-icon bg-yellow-50 text-yellow-500">
                <FaStar />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-800">Client Satisfaction</div>
                <div className="text-[0.65rem] text-gray-500">Your trust means everything to us</div>
              </div>
            </div>
          </div>
          
          {/* ── Immediate Assistance CTA ── */}
          <div className="mt-8 rounded-xl overflow-hidden bg-[#071b4a] flex flex-col md:flex-row items-center justify-between p-6 md:px-8 border border-[#d4a017]/20 shadow-xl">
            <div className="flex items-center gap-5 text-white mb-6 md:mb-0">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl flex-shrink-0">
                <FaHeadset />
              </div>
              <div>
                <div className="text-[#f4c24b] text-[0.65rem] font-bold uppercase tracking-wider mb-1">Need Immediate Assistance?</div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">We're here to help!</h3>
                <p className="text-xs text-blue-200 mt-2 max-w-md hidden md:block">For urgent queries, you can call us during business hours or email us and our team will get back to you as soon as possible.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <a 
                href="tel:+918437566186"
                className="flex-1 md:flex-none bg-[#f4c24b] hover:bg-[#d4a017] text-[#1a1200] font-bold py-3 px-6 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <FaPhoneAlt /> Call Now
              </a>
              <a 
                href="mailto:info@apnaenterprise.in"
                className="flex-1 md:flex-none bg-transparent hover:bg-white/5 border border-white/20 text-white font-bold py-3 px-6 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <FaEnvelope /> Email Us
              </a>
            </div>
          </div>
          
        </div>
      </section>
    </div>
  );
}

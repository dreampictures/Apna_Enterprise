import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "en" | "pa";

/* ── Translation shapes ────────────────────────────────────────── */
export interface Translations {
  // Navbar / Layout
  nav_home: string;
  nav_services: string;
  nav_updates: string;
  nav_apply: string;
  nav_contact: string;
  brand_tagline: string;
  footer_tagline: string;
  footer_desc: string;
  footer_quick_links: string;
  footer_contact_info: string;
  footer_visitors: string;
  footer_managed_by: string;
  footer_rights: string;

  // Home
  home_badge: string;
  home_hero_title1: string;
  home_hero_title2: string;
  home_hero_desc: string;
  home_explore: string;
  home_contact: string;
  home_happy_customers: string;
  home_services_available: string;
  home_trusted_since: string;
  home_about_label: string;
  home_about_title: string;
  home_about_p1: string;
  home_about_p2: string;
  home_bullet1: string;
  home_bullet2: string;
  home_bullet3: string;
  home_bullet4: string;
  home_get_in_touch: string;
  home_in_business: string;
  home_success_rate: string;
  home_expert_support: string;
  home_what_we_offer: string;
  home_our_services: string;
  home_services_desc: (n: number) => string;
  home_view_all: string;
  home_apply_any: string;
  home_cta_label: string;
  home_cta_title: string;
  home_cta_desc: string;
  home_apply_now: string;

  // Services
  services_all_label: string;
  services_title: string;
  services_desc: string;
  services_search_placeholder: string;
  services_all_chip: string;
  services_not_found: string;
  services_not_found_sub: string;
  services_clear: string;
  services_available: (n: number) => string;
  services_coming_soon: string;
  services_walkin: string;
  services_apply: string;
  services_more: (n: number) => string;

  // Apply
  apply_online_label: string;
  apply_title: string;
  apply_subtitle: string;
  apply_form_title: string;
  apply_form_subtitle: string;
  apply_name: string;
  apply_name_placeholder: string;
  apply_phone: string;
  apply_phone_placeholder: string;
  apply_email: string;
  apply_email_placeholder: string;
  apply_service: string;
  apply_service_placeholder: string;
  apply_message: string;
  apply_message_placeholder: string;
  apply_callback_label: string;
  apply_callback_desc: string;
  apply_submitting: string;
  apply_submit: string;
  apply_error: string;
  apply_submitted_title: string;
  apply_thank_you: string;
  apply_success_desc: (service: string) => string;
  apply_tracking_label: string;
  apply_tracking_copy: string;
  apply_tracking_copied: string;
  apply_tracking_note: string;
  apply_email_followup: string;
  apply_another: string;
  apply_val_name: string;
  apply_val_phone: string;
  apply_val_email: string;
  apply_val_service: string;
  apply_payment_title: string;
  apply_payment_heading: string;
  apply_payment_desc: string;
  apply_payment_service: string;
  apply_payment_amount: string;
  apply_pay_now: string;
  apply_payment_secure: string;
  apply_payment_failed: string;

  // Track
  track_title: string;
  track_subtitle: string;
  track_placeholder: string;
  track_btn: string;
  track_not_found: string;
  track_not_found_sub: string;
  track_status_label: string;
  track_service_label: string;
  track_date_label: string;
  track_callback_yes: string;
  track_callback_no: string;
  track_status_pending: string;
  track_status_review: string;
  track_status_applying: string;
  track_status_applied: string;
  track_status_rejected: string;
  track_status_completed: string;

  // Contact
  contact_reach_out: string;
  contact_title: string;
  contact_subtitle: string;
  contact_card_title: string;
  contact_card_sub: string;
  contact_email_label: string;
  contact_address_label: string;
  contact_hours_label: string;
  contact_hours_days: string;
  contact_hours_closed: string;
  contact_directions: string;
  contact_need_help: string;
  contact_help_desc: string;
  contact_email_btn: string;
  contact_apply_btn: string;

  // Updates
  updates_stay_informed: string;
  updates_title: string;
  updates_subtitle: string;
  updates_cat_all: string;
  updates_cat_jobs: string;
  updates_cat_admit: string;
  updates_cat_result: string;
  updates_cat_scheme: string;
  updates_cat_notice: string;
  updates_cat_announcement: string;
  updates_cat_offer: string;
  updates_no_items: string;
  updates_no_items_sub: string;
  updates_count: (n: number) => string;
  updates_vacancies: string;
  updates_last_date: string;
  updates_expired: string;
  updates_start: string;
  updates_active: string;
  updates_closed: string;
  updates_know_more: string;
  updates_apply: string;
  updates_prev: string;
  updates_next: string;

  // UpdateDetail
  detail_back: string;
  detail_urgent: string;
  detail_featured: string;
  detail_closed: string;
  detail_active: string;
  detail_important_info: string;
  detail_department: string;
  detail_vacancies: string;
  detail_start_date: string;
  detail_last_date: string;
  detail_quick_actions: string;
  detail_apply_online: string;
  detail_apps_closed: string;
  detail_official_notice: string;
  detail_official_website: string;
  detail_share_wa: string;
  detail_back_link: string;
  detail_not_found_title: string;
  detail_not_found_sub: string;
  detail_back_btn: string;

  // NewsTicker
  ticker_latest: string;
  ticker_urgent: string;
}

/* ══════════════════════════════════════════════════════════════
   ENGLISH
══════════════════════════════════════════════════════════════ */
const en: Translations = {
  nav_home: "Home",
  nav_services: "Services",
  nav_updates: "Updates",
  nav_apply: "Apply Now",
  nav_contact: "Contact Us",
  brand_tagline: "PROFESSIONAL SERVICES",
  footer_tagline: "YOUR TRUSTED SERVICE PARTNER",
  footer_desc: "Your trusted partner for travel ticketing, government documents, online forms, printing, financial services, and international parcels in Firozepur, Punjab.",
  footer_quick_links: "Quick Links",
  footer_contact_info: "Contact Information",
  footer_visitors: "Visitors:",
  footer_managed_by: "Managed by",
  footer_rights: "All rights reserved",

  home_badge: "Firozepur's Trusted Multi-Service Centre",
  home_hero_title1: "Professional Services",
  home_hero_title2: "for Everyday Needs",
  home_hero_desc: "Your trusted local partner for travel ticketing, government documents, online forms, printing, finance, and international parcels. We make complex procedures simple.",
  home_explore: "Explore Services",
  home_contact: "Contact Us",
  home_happy_customers: "Happy Customers",
  home_services_available: "Services Available",
  home_trusted_since: "Trusted Since",
  home_about_label: "About Us",
  home_about_title: "Your Trusted Partner for Every Service Need",
  home_about_p1: "Apna Enterprise is a trusted multi-service centre in Firozepur, Punjab, dedicated to making essential government and travel services accessible to everyone. We started with a simple belief — no one should struggle with paperwork, long queues, or confusing processes.",
  home_about_p2: "From booking air and train tickets to processing PAN cards, Aadhaar updates, Voter IDs, passports, GST registration, and international parcels, we handle it all with speed, accuracy, and a personal touch.",
  home_bullet1: "100% transparent pricing — no hidden charges",
  home_bullet2: "Fast processing with real-time updates",
  home_bullet3: "Experienced team with deep local knowledge",
  home_bullet4: "Serving thousands of happy customers",
  home_get_in_touch: "Get in Touch",
  home_in_business: "In Business",
  home_success_rate: "Success Rate",
  home_expert_support: "Expert Support",
  home_what_we_offer: "What We Offer",
  home_our_services: "Our Services",
  home_services_desc: (n) => `We offer ${n}+ services across 6 categories to meet all your needs.`,
  home_view_all: "View All",
  home_apply_any: "Apply for Any Service",
  home_cta_label: "Ready to Get Started?",
  home_cta_title: "Let Us Handle the Paperwork",
  home_cta_desc: "Walk in or apply online — our team will guide you through every step.",
  home_apply_now: "Apply Now",

  services_all_label: "All Services",
  services_title: "Our Services",
  services_desc: "Travel, government documents, online forms, printing, finance, and more — all under one roof.",
  services_search_placeholder: "Search services...",
  services_all_chip: "All",
  services_not_found: "No services found",
  services_not_found_sub: "Try a different search term or clear the filter.",
  services_clear: "Clear filters",
  services_available: (n) => `${n} service${n !== 1 ? "s" : ""} available`,
  services_coming_soon: "Coming Soon",
  services_walkin: "Walk-in / Visit Us",
  services_apply: "Apply Now",
  services_more: (n) => `+${n} more`,

  apply_online_label: "Apply Online",
  apply_title: "Apply for a Service",
  apply_subtitle: "Fill in your details below and our team will reach out within 24 hours.",
  apply_form_title: "Service Application",
  apply_form_subtitle: "All fields marked are required",
  apply_name: "Full Name",
  apply_name_placeholder: "Enter your full name",
  apply_phone: "Phone Number",
  apply_phone_placeholder: "+91 98765 43210",
  apply_email: "Email Address",
  apply_email_placeholder: "Enter your email address",
  apply_service: "Service Type",
  apply_service_placeholder: "Select a service",
  apply_message: "Message (Optional)",
  apply_message_placeholder: "Any additional details or special requirements...",
  apply_submitting: "Submitting...",
  apply_submit: "Submit Application",
  apply_error: "Something went wrong. Please try again.",
  apply_submitted_title: "Application Submitted",
  apply_thank_you: "Thank You!",
  apply_success_desc: (s) => `Your application for ${s} has been received. Our team will contact you shortly.`,
  apply_callback_label: "Request a Callback",
  apply_callback_desc: "Our team will call you to collect documents and guide you through the process.",
  apply_email_followup: "Email Us for Follow-up",
  apply_another: "Submit Another Application",
  apply_tracking_label: "Your Tracking Number",
  apply_tracking_copy: "Copy",
  apply_tracking_copied: "Copied!",
  apply_tracking_note: "Save this number to track your application status anytime at Track Application.",
  apply_val_name: "Name must be at least 2 characters",
  apply_val_phone: "Enter a valid phone number",
  apply_val_email: "Enter a valid email address",
  apply_val_service: "Please select a service",
  apply_payment_title: "Secure Payment",
  apply_payment_heading: "Complete Your Payment",
  apply_payment_desc: "Your application is saved. Continue to PayU to securely pay the service fee.",
  apply_payment_service: "Service",
  apply_payment_amount: "Amount to pay",
  apply_pay_now: "Pay Securely with PayU",
  apply_payment_secure: "You will be redirected to PayU's secure payment page.",
  apply_payment_failed: "Payment was not completed. You can try again or contact our office.",

  track_title: "Track Your Application",
  track_subtitle: "Enter your tracking number to check the status of your application.",
  track_placeholder: "e.g. AE260726ABCD",
  track_btn: "Track",
  track_not_found: "Application Not Found",
  track_not_found_sub: "No application found with this tracking number. Please check and try again.",
  track_status_label: "Status",
  track_service_label: "Service",
  track_date_label: "Submitted On",
  track_callback_yes: "✓ Callback Requested",
  track_callback_no: "No callback requested",
  track_status_pending: "Pending — Awaiting Review",
  track_status_review: "Under Review",
  track_status_applying: "Application In Progress",
  track_status_applied: "Applied",
  track_status_rejected: "Rejected",
  track_status_completed: "Completed ✓",

  contact_reach_out: "Reach Out",
  contact_title: "Contact Us",
  contact_subtitle: "Reach us anytime — we are here to assist you Monday through Saturday.",
  contact_card_title: "Get in Touch",
  contact_card_sub: "We'd love to hear from you.",
  contact_email_label: "Email",
  contact_address_label: "Address",
  contact_hours_label: "Business Hours",
  contact_hours_days: "Mon – Sat: 9:00 AM – 7:00 PM",
  contact_hours_closed: "Sundays & Public Holidays: Closed",
  contact_directions: "Get Directions",
  contact_need_help: "Need Assistance?",
  contact_help_desc: "Email us or submit an application form and our team will get back to you within 24 hours.",
  contact_email_btn: "Email Us",
  contact_apply_btn: "Apply for a Service",

  updates_stay_informed: "Stay Informed",
  updates_title: "Updates & Announcements",
  updates_subtitle: "Latest government jobs, admit cards, results, schemes, and notices — all in one place.",
  updates_cat_all: "All Updates",
  updates_cat_jobs: "Govt Jobs",
  updates_cat_admit: "Admit Card",
  updates_cat_result: "Result",
  updates_cat_scheme: "Schemes",
  updates_cat_notice: "Notices",
  updates_cat_announcement: "Announcements",
  updates_cat_offer: "Offers",
  updates_no_items: "No announcements found",
  updates_no_items_sub: "Check back soon for updates.",
  updates_count: (n) => `${n} update${n !== 1 ? "s" : ""} found`,
  updates_vacancies: "Vacancies",
  updates_last_date: "Last Date:",
  updates_expired: "(Expired)",
  updates_start: "Start:",
  updates_active: "● Active",
  updates_closed: "○ Closed",
  updates_know_more: "Know More",
  updates_apply: "Apply",
  updates_prev: "← Previous",
  updates_next: "Next →",

  detail_back: "Back to Updates",
  detail_urgent: "URGENT",
  detail_featured: "Featured",
  detail_closed: "Closed",
  detail_active: "Active",
  detail_important_info: "Important Information",
  detail_department: "Department / Organization",
  detail_vacancies: "Total Vacancies",
  detail_start_date: "Application Start Date",
  detail_last_date: "Last Date to Apply",
  detail_quick_actions: "Quick Actions",
  detail_apply_online: "Apply Online",
  detail_apps_closed: "Applications Closed",
  detail_official_notice: "Official Notice",
  detail_official_website: "Official Website",
  detail_share_wa: "Share on WhatsApp",
  detail_back_link: "← Back to Updates",
  detail_not_found_title: "Announcement Not Found",
  detail_not_found_sub: "This post may have been removed or the link is incorrect.",
  detail_back_btn: "Back to Updates",

  ticker_latest: "Latest",
  ticker_urgent: "URGENT",
};

/* ══════════════════════════════════════════════════════════════
   PUNJABI (GURMUKHI)
══════════════════════════════════════════════════════════════ */
const pa: Translations = {
  nav_home: "ਮੁੱਖ ਪੰਨਾ",
  nav_services: "ਸੇਵਾਵਾਂ",
  nav_updates: "ਅਪਡੇਟਸ",
  nav_apply: "ਅਰਜ਼ੀ ਦਿਓ",
  nav_contact: "ਸੰਪਰਕ ਕਰੋ",
  brand_tagline: "ਪੇਸ਼ੇਵਰ ਸੇਵਾਵਾਂ",
  footer_tagline: "ਤੁਹਾਡਾ ਭਰੋਸੇਯੋਗ ਸੇਵਾ ਸਾਥੀ",
  footer_desc: "ਫ਼ਿਰੋਜ਼ਪੁਰ, ਪੰਜਾਬ ਵਿੱਚ ਟ੍ਰੈਵਲ ਟਿਕਟਿੰਗ, ਸਰਕਾਰੀ ਦਸਤਾਵੇਜ਼ਾਂ, ਔਨਲਾਈਨ ਫਾਰਮਾਂ, ਪ੍ਰਿੰਟਿੰਗ, ਵਿੱਤੀ ਸੇਵਾਵਾਂ ਅਤੇ ਅੰਤਰਰਾਸ਼ਟਰੀ ਪਾਰਸਲਾਂ ਲਈ ਤੁਹਾਡਾ ਭਰੋਸੇਯੋਗ ਸਾਥੀ।",
  footer_quick_links: "ਤੇਜ਼ ਲਿੰਕ",
  footer_contact_info: "ਸੰਪਰਕ ਜਾਣਕਾਰੀ",
  footer_visitors: "ਸੈਲਾਨੀ:",
  footer_managed_by: "ਪ੍ਰਬੰਧਿਤ",
  footer_rights: "ਸਾਰੇ ਹੱਕ ਰਾਖਵੇਂ",

  home_badge: "ਫ਼ਿਰੋਜ਼ਪੁਰ ਦਾ ਭਰੋਸੇਯੋਗ ਮਲਟੀ-ਸਰਵਿਸ ਸੈਂਟਰ",
  home_hero_title1: "ਪੇਸ਼ੇਵਰ ਸੇਵਾਵਾਂ",
  home_hero_title2: "ਰੋਜ਼ਮਰ੍ਹਾ ਦੀਆਂ ਲੋੜਾਂ ਲਈ",
  home_hero_desc: "ਟ੍ਰੈਵਲ ਟਿਕਟਿੰਗ, ਸਰਕਾਰੀ ਦਸਤਾਵੇਜ਼ਾਂ, ਔਨਲਾਈਨ ਫਾਰਮਾਂ, ਪ੍ਰਿੰਟਿੰਗ, ਵਿੱਤ ਅਤੇ ਅੰਤਰਰਾਸ਼ਟਰੀ ਪਾਰਸਲਾਂ ਲਈ ਤੁਹਾਡਾ ਭਰੋਸੇਯੋਗ ਸਥਾਨਕ ਸਾਥੀ। ਅਸੀਂ ਔਖੀਆਂ ਪ੍ਰਕਿਰਿਆਵਾਂ ਨੂੰ ਸਰਲ ਬਣਾਉਂਦੇ ਹਾਂ।",
  home_explore: "ਸੇਵਾਵਾਂ ਦੇਖੋ",
  home_contact: "ਸੰਪਰਕ ਕਰੋ",
  home_happy_customers: "ਖੁਸ਼ ਗਾਹਕ",
  home_services_available: "ਉਪਲਬਧ ਸੇਵਾਵਾਂ",
  home_trusted_since: "ਭਰੋਸੇਯੋਗ ਸਾਲਾਂ ਤੋਂ",
  home_about_label: "ਸਾਡੇ ਬਾਰੇ",
  home_about_title: "ਹਰ ਸੇਵਾ ਲੋੜ ਲਈ ਤੁਹਾਡਾ ਭਰੋਸੇਯੋਗ ਸਾਥੀ",
  home_about_p1: "ਅਪਣਾ ਐਂਟਰਪ੍ਰਾਈਜ਼ ਫ਼ਿਰੋਜ਼ਪੁਰ, ਪੰਜਾਬ ਵਿੱਚ ਇੱਕ ਭਰੋਸੇਯੋਗ ਮਲਟੀ-ਸਰਵਿਸ ਸੈਂਟਰ ਹੈ, ਜੋ ਜ਼ਰੂਰੀ ਸਰਕਾਰੀ ਅਤੇ ਟ੍ਰੈਵਲ ਸੇਵਾਵਾਂ ਨੂੰ ਸਾਰਿਆਂ ਲਈ ਸੁਲਭ ਬਣਾਉਣ ਲਈ ਸਮਰਪਿਤ ਹੈ। ਅਸੀਂ ਇੱਕ ਸਧਾਰਨ ਵਿਸ਼ਵਾਸ ਨਾਲ ਸ਼ੁਰੂ ਕੀਤਾ — ਕਿਸੇ ਨੂੰ ਵੀ ਕਾਗਜ਼ੀ ਕਾਰਵਾਈ, ਲੰਮੀਆਂ ਕਤਾਰਾਂ ਜਾਂ ਉਲਝਣ ਭਰੀਆਂ ਪ੍ਰਕਿਰਿਆਵਾਂ ਨਾਲ ਜੂਝਣਾ ਨਹੀਂ ਚਾਹੀਦਾ।",
  home_about_p2: "ਹਵਾਈ ਅਤੇ ਰੇਲ ਟਿਕਟਾਂ ਬੁੱਕ ਕਰਨ ਤੋਂ ਲੈ ਕੇ PAN ਕਾਰਡ, ਆਧਾਰ ਅੱਪਡੇਟ, ਵੋਟਰ ID, ਪਾਸਪੋਰਟ, GST ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਅਤੇ ਅੰਤਰਰਾਸ਼ਟਰੀ ਪਾਰਸਲਾਂ ਤੱਕ, ਅਸੀਂ ਸਭ ਕੁਝ ਤੇਜ਼ੀ, ਸ਼ੁੱਧਤਾ ਅਤੇ ਨਿੱਜੀ ਸਪਰਸ਼ ਨਾਲ ਸੰਭਾਲਦੇ ਹਾਂ।",
  home_bullet1: "100% ਪਾਰਦਰਸ਼ੀ ਕੀਮਤਾਂ — ਕੋਈ ਲੁਕਵੇਂ ਚਾਰਜ ਨਹੀਂ",
  home_bullet2: "ਰੀਅਲ-ਟਾਈਮ ਅੱਪਡੇਟਸ ਨਾਲ ਤੇਜ਼ ਪ੍ਰੋਸੈਸਿੰਗ",
  home_bullet3: "ਡੂੰਘੇ ਸਥਾਨਕ ਗਿਆਨ ਵਾਲੀ ਤਜਰਬੇਕਾਰ ਟੀਮ",
  home_bullet4: "ਹਜ਼ਾਰਾਂ ਖੁਸ਼ ਗਾਹਕਾਂ ਦੀ ਸੇਵਾ ਕਰਦੇ ਹੋਏ",
  home_get_in_touch: "ਸੰਪਰਕ ਕਰੋ",
  home_in_business: "ਕਾਰੋਬਾਰ ਵਿੱਚ",
  home_success_rate: "ਸਫਲਤਾ ਦਰ",
  home_expert_support: "ਮਾਹਰ ਸਹਾਇਤਾ",
  home_what_we_offer: "ਅਸੀਂ ਕੀ ਦਿੰਦੇ ਹਾਂ",
  home_our_services: "ਸਾਡੀਆਂ ਸੇਵਾਵਾਂ",
  home_services_desc: (n) => `ਅਸੀਂ 6 ਕੈਟਾਗਰੀਆਂ ਵਿੱਚ ${n}+ ਸੇਵਾਵਾਂ ਪੇਸ਼ ਕਰਦੇ ਹਾਂ।`,
  home_view_all: "ਸਭ ਦੇਖੋ",
  home_apply_any: "ਕਿਸੇ ਵੀ ਸੇਵਾ ਲਈ ਅਰਜ਼ੀ ਦਿਓ",
  home_cta_label: "ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਤਿਆਰ?",
  home_cta_title: "ਕਾਗਜ਼ੀ ਕੰਮ ਸਾਡੇ ਤੇ ਛੱਡੋ",
  home_cta_desc: "ਅੰਦਰ ਆਓ ਜਾਂ ਔਨਲਾਈਨ ਅਰਜ਼ੀ ਦਿਓ — ਸਾਡੀ ਟੀਮ ਹਰ ਕਦਮ ਤੇ ਤੁਹਾਡੀ ਅਗਵਾਈ ਕਰੇਗੀ।",
  home_apply_now: "ਹੁਣੇ ਅਰਜ਼ੀ ਦਿਓ",

  services_all_label: "ਸਾਰੀਆਂ ਸੇਵਾਵਾਂ",
  services_title: "ਸਾਡੀਆਂ ਸੇਵਾਵਾਂ",
  services_desc: "ਯਾਤਰਾ, ਸਰਕਾਰੀ ਦਸਤਾਵੇਜ਼, ਔਨਲਾਈਨ ਫਾਰਮ, ਪ੍ਰਿੰਟਿੰਗ, ਵਿੱਤ ਅਤੇ ਹੋਰ — ਸਭ ਇੱਕ ਛੱਤ ਹੇਠਾਂ।",
  services_search_placeholder: "ਸੇਵਾਵਾਂ ਖੋਜੋ...",
  services_all_chip: "ਸਭ",
  services_not_found: "ਕੋਈ ਸੇਵਾ ਨਹੀਂ ਮਿਲੀ",
  services_not_found_sub: "ਵੱਖਰੀ ਖੋਜ ਕੋਸ਼ਿਸ਼ ਕਰੋ ਜਾਂ ਫਿਲਟਰ ਸਾਫ਼ ਕਰੋ।",
  services_clear: "ਫਿਲਟਰ ਸਾਫ਼ ਕਰੋ",
  services_available: (n) => `${n} ਸੇਵਾ${n !== 1 ? "ਵਾਂ" : ""} ਉਪਲਬਧ`,
  services_coming_soon: "ਜਲਦੀ ਆ ਰਿਹਾ ਹੈ",
  services_walkin: "ਸਿੱਧੇ ਆਓ",
  services_apply: "ਅਰਜ਼ੀ ਦਿਓ",
  services_more: (n) => `+${n} ਹੋਰ`,

  apply_online_label: "ਔਨਲਾਈਨ ਅਰਜ਼ੀ ਦਿਓ",
  apply_title: "ਸੇਵਾ ਲਈ ਅਰਜ਼ੀ ਦਿਓ",
  apply_subtitle: "ਹੇਠਾਂ ਆਪਣੀ ਜਾਣਕਾਰੀ ਭਰੋ ਅਤੇ ਸਾਡੀ ਟੀਮ 24 ਘੰਟਿਆਂ ਵਿੱਚ ਸੰਪਰਕ ਕਰੇਗੀ।",
  apply_form_title: "ਸੇਵਾ ਅਰਜ਼ੀ",
  apply_form_subtitle: "ਸਾਰੇ ਖੇਤਰ ਭਰਨੇ ਜ਼ਰੂਰੀ ਹਨ",
  apply_name: "ਪੂਰਾ ਨਾਮ",
  apply_name_placeholder: "ਆਪਣਾ ਪੂਰਾ ਨਾਮ ਦਾਖਲ ਕਰੋ",
  apply_phone: "ਫ਼ੋਨ ਨੰਬਰ",
  apply_phone_placeholder: "+91 98765 43210",
  apply_service: "ਸੇਵਾ ਦੀ ਕਿਸਮ",
  apply_service_placeholder: "ਸੇਵਾ ਚੁਣੋ",
  apply_message: "ਸੁਨੇਹਾ (ਵਿਕਲਪਿਕ)",
  apply_message_placeholder: "ਕੋਈ ਵਾਧੂ ਜਾਣਕਾਰੀ ਜਾਂ ਵਿਸ਼ੇਸ਼ ਲੋੜਾਂ...",
  apply_submitting: "ਜਮ੍ਹਾਂ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
  apply_submit: "ਅਰਜ਼ੀ ਜਮ੍ਹਾਂ ਕਰੋ",
  apply_error: "ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  apply_submitted_title: "ਅਰਜ਼ੀ ਜਮ੍ਹਾਂ ਹੋ ਗਈ",
  apply_thank_you: "ਧੰਨਵਾਦ!",
  apply_success_desc: (s) => `ਤੁਹਾਡੀ ${s} ਲਈ ਅਰਜ਼ੀ ਪ੍ਰਾਪਤ ਹੋ ਗਈ ਹੈ। ਸਾਡੀ ਟੀਮ ਜਲਦੀ ਸੰਪਰਕ ਕਰੇਗੀ।`,
  apply_callback_label: "ਕਾਲਬੈਕ ਦੀ ਬੇਨਤੀ ਕਰੋ",
  apply_callback_desc: "ਸਾਡੀ ਟੀਮ ਦਸਤਾਵੇਜ਼ ਇਕੱਠੇ ਕਰਨ ਲਈ ਫ਼ੋਨ ਕਰੇਗੀ।",
  apply_email_followup: "ਫਾਲੋ-ਅੱਪ ਲਈ ਈਮੇਲ ਕਰੋ",
  apply_another: "ਹੋਰ ਅਰਜ਼ੀ ਦਿਓ",
  apply_tracking_label: "ਤੁਹਾਡਾ ਟ੍ਰੈਕਿੰਗ ਨੰਬਰ",
  apply_tracking_copy: "ਕਾਪੀ ਕਰੋ",
  apply_tracking_copied: "ਕਾਪੀ ਹੋ ਗਿਆ!",
  apply_tracking_note: "ਇਸ ਨੰਬਰ ਨਾਲ ਆਪਣੀ ਅਰਜ਼ੀ ਟ੍ਰੈਕ ਕਰ ਸਕਦੇ ਹੋ।",
  apply_val_name: "ਨਾਮ ਘੱਟੋ-ਘੱਟ 2 ਅੱਖਰਾਂ ਦਾ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ",
  apply_val_phone: "ਸਹੀ ਫ਼ੋਨ ਨੰਬਰ ਦਾਖਲ ਕਰੋ",
  apply_val_service: "ਕਿਰਪਾ ਕਰਕੇ ਸੇਵਾ ਚੁਣੋ",

  track_title: "ਅਰਜ਼ੀ ਟ੍ਰੈਕ ਕਰੋ",
  track_subtitle: "ਆਪਣੀ ਅਰਜ਼ੀ ਦੀ ਸਥਿਤੀ ਜਾਣਨ ਲਈ ਟ੍ਰੈਕਿੰਗ ਨੰਬਰ ਦਾਖਲ ਕਰੋ।",
  track_placeholder: "ਜਿਵੇਂ AE260726ABCD",
  track_btn: "ਟ੍ਰੈਕ ਕਰੋ",
  track_not_found: "ਅਰਜ਼ੀ ਨਹੀਂ ਮਿਲੀ",
  track_not_found_sub: "ਇਸ ਨੰਬਰ ਨਾਲ ਕੋਈ ਅਰਜ਼ੀ ਨਹੀਂ ਮਿਲੀ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  track_status_label: "ਸਥਿਤੀ",
  track_service_label: "ਸੇਵਾ",
  track_date_label: "ਜਮ੍ਹਾਂ ਕੀਤੀ ਤਾਰੀਖ",
  track_callback_yes: "✓ ਕਾਲਬੈਕ ਬੇਨਤੀ ਕੀਤੀ",
  track_callback_no: "ਕਾਲਬੈਕ ਬੇਨਤੀ ਨਹੀਂ",
  track_status_pending: "ਉਡੀਕ ਵਿੱਚ — ਸਮੀਖਿਆ ਬਾਕੀ",
  track_status_review: "ਸਮੀਖਿਆ ਹੋ ਰਹੀ ਹੈ",
  track_status_applying: "ਅਰਜ਼ੀ ਪ੍ਰਕਿਰਿਆ ਜਾਰੀ",
  track_status_applied: "ਅਰਜ਼ੀ ਦਿੱਤੀ ਗਈ",
  track_status_rejected: "ਰੱਦ ਕੀਤੀ ਗਈ",
  track_status_completed: "ਮੁਕੰਮਲ ✓",

  contact_reach_out: "ਸੰਪਰਕ ਕਰੋ",
  contact_title: "ਸਾਡੇ ਨਾਲ ਜੁੜੋ",
  contact_subtitle: "ਕਿਸੇ ਵੀ ਸਮੇਂ ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੋ — ਅਸੀਂ ਸੋਮਵਾਰ ਤੋਂ ਸ਼ਨੀਵਾਰ ਤੁਹਾਡੀ ਮਦਦ ਲਈ ਹਾਜ਼ਰ ਹਾਂ।",
  contact_card_title: "ਸੰਪਰਕ ਕਰੋ",
  contact_card_sub: "ਅਸੀਂ ਤੁਹਾਡੇ ਤੋਂ ਸੁਣਨਾ ਪਸੰਦ ਕਰਾਂਗੇ।",
  contact_email_label: "ਈਮੇਲ",
  contact_address_label: "ਪਤਾ",
  contact_hours_label: "ਕਾਰੋਬਾਰੀ ਸਮਾਂ",
  contact_hours_days: "ਸੋਮ – ਸ਼ਨੀ: ਸਵੇਰੇ 9 – ਸ਼ਾਮ 7",
  contact_hours_closed: "ਐਤਵਾਰ ਅਤੇ ਸਰਕਾਰੀ ਛੁੱਟੀਆਂ: ਬੰਦ",
  contact_directions: "ਰਸਤਾ ਦੱਸੋ",
  contact_need_help: "ਮਦਦ ਚਾਹੀਦੀ ਹੈ?",
  contact_help_desc: "ਸਾਨੂੰ ਈਮੇਲ ਕਰੋ ਜਾਂ ਅਰਜ਼ੀ ਫਾਰਮ ਭਰੋ ਅਤੇ ਸਾਡੀ ਟੀਮ 24 ਘੰਟਿਆਂ ਵਿੱਚ ਜਵਾਬ ਦੇਵੇਗੀ।",
  contact_email_btn: "ਈਮੇਲ ਕਰੋ",
  contact_apply_btn: "ਸੇਵਾ ਲਈ ਅਰਜ਼ੀ ਦਿਓ",

  updates_stay_informed: "ਜਾਣਕਾਰ ਰਹੋ",
  updates_title: "ਅਪਡੇਟਸ ਅਤੇ ਐਲਾਨ",
  updates_subtitle: "ਤਾਜ਼ਾ ਸਰਕਾਰੀ ਨੌਕਰੀਆਂ, ਐਡਮਿਟ ਕਾਰਡ, ਨਤੀਜੇ, ਯੋਜਨਾਵਾਂ ਅਤੇ ਨੋਟਿਸ — ਸਭ ਇੱਕ ਥਾਂ।",
  updates_cat_all: "ਸਾਰੇ ਅਪਡੇਟਸ",
  updates_cat_jobs: "ਸਰਕਾਰੀ ਨੌਕਰੀਆਂ",
  updates_cat_admit: "ਐਡਮਿਟ ਕਾਰਡ",
  updates_cat_result: "ਨਤੀਜਾ",
  updates_cat_scheme: "ਯੋਜਨਾਵਾਂ",
  updates_cat_notice: "ਨੋਟਿਸ",
  updates_cat_announcement: "ਐਲਾਨ",
  updates_cat_offer: "ਆਫ਼ਰ",
  updates_no_items: "ਕੋਈ ਐਲਾਨ ਨਹੀਂ ਮਿਲਿਆ",
  updates_no_items_sub: "ਅਪਡੇਟਸ ਲਈ ਜਲਦੀ ਵਾਪਸ ਦੇਖੋ।",
  updates_count: (n) => `${n} ਅਪਡੇਟ${n !== 1 ? "ਸ" : ""} ਮਿਲ${n !== 1 ? "ੇ" : "ਿਆ"}`,
  updates_vacancies: "ਅਸਾਮੀਆਂ",
  updates_last_date: "ਆਖਰੀ ਤਾਰੀਖ:",
  updates_expired: "(ਮਿਆਦ ਖਤਮ)",
  updates_start: "ਸ਼ੁਰੂਆਤ:",
  updates_active: "● ਸਕਿਰਿਆ",
  updates_closed: "○ ਬੰਦ",
  updates_know_more: "ਹੋਰ ਜਾਣੋ",
  updates_apply: "ਅਰਜ਼ੀ ਦਿਓ",
  updates_prev: "← ਪਿਛਲਾ",
  updates_next: "ਅਗਲਾ →",

  detail_back: "ਅਪਡੇਟਸ ਤੇ ਵਾਪਸ",
  detail_urgent: "ਜ਼ਰੂਰੀ",
  detail_featured: "ਫੀਚਰਡ",
  detail_closed: "ਬੰਦ",
  detail_active: "ਸਕਿਰਿਆ",
  detail_important_info: "ਮਹੱਤਵਪੂਰਨ ਜਾਣਕਾਰੀ",
  detail_department: "ਵਿਭਾਗ / ਸੰਸਥਾ",
  detail_vacancies: "ਕੁੱਲ ਅਸਾਮੀਆਂ",
  detail_start_date: "ਅਰਜ਼ੀ ਸ਼ੁਰੂ ਦੀ ਤਾਰੀਖ",
  detail_last_date: "ਅਰਜ਼ੀ ਦੀ ਆਖਰੀ ਤਾਰੀਖ",
  detail_quick_actions: "ਤੇਜ਼ ਕਾਰਵਾਈਆਂ",
  detail_apply_online: "ਔਨਲਾਈਨ ਅਰਜ਼ੀ ਦਿਓ",
  detail_apps_closed: "ਅਰਜ਼ੀਆਂ ਬੰਦ",
  detail_official_notice: "ਅਧਿਕਾਰਤ ਨੋਟਿਸ",
  detail_official_website: "ਅਧਿਕਾਰਤ ਵੈੱਬਸਾਈਟ",
  detail_share_wa: "WhatsApp ਤੇ ਸ਼ੇਅਰ ਕਰੋ",
  detail_back_link: "← ਅਪਡੇਟਸ ਤੇ ਵਾਪਸ",
  detail_not_found_title: "ਐਲਾਨ ਨਹੀਂ ਮਿਲਿਆ",
  detail_not_found_sub: "ਇਹ ਪੋਸਟ ਹਟਾ ਦਿੱਤੀ ਗਈ ਹੈ ਜਾਂ ਲਿੰਕ ਗਲਤ ਹੈ।",
  detail_back_btn: "ਅਪਡੇਟਸ ਤੇ ਵਾਪਸ",

  ticker_latest: "ਤਾਜ਼ਾ",
  ticker_urgent: "ਜ਼ਰੂਰੀ",
};

/* ── Context ────────────────────────────────────────────────── */
interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en", setLang: () => {}, t: en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem("apna_lang");
      return saved === "pa" ? "pa" : "en";
    } catch { return "en"; }
  });

  function setLang(l: Lang) {
    setLangState(l);
    try { localStorage.setItem("apna_lang", l); } catch { /* ignore */ }
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: lang === "pa" ? pa : en }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useT() {
  return useContext(LanguageContext);
}

import { Link } from "wouter";
import { FaHome, FaArrowRight, FaExclamationTriangle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-full">
      <Seo
        title="Page Not Found"
        description="The page you're looking for doesn't exist. Head back to Apna Enterprise's homepage or explore our services."
        path="/404"
        noindex={true}
      />
      <section className="hero-navy text-white py-16 flex-shrink-0">
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <p className="font-semibold uppercase tracking-widest text-xs mb-3" style={{ color: "#F2C14E" }}>
            Error 404
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Page Not Found</h1>
          <div className="gold-line w-20 mx-auto" />
        </div>
      </section>

      <section
        className="flex-1 flex items-center justify-center py-20 px-4"
        style={{ background: "#f8fafd" }}
      >
        <div className="text-center max-w-md">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{
              background: "rgba(7,27,74,0.07)",
              border: "2px solid rgba(7,27,74,0.1)",
            }}
          >
            <FaExclamationTriangle className="text-4xl" style={{ color: "#D4A017" }} />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">
            Oops! This page doesn't exist.
          </h2>
          <p className="text-slate-500 leading-relaxed mb-8">
            The page you're looking for may have been moved or the link might be incorrect.
            Head back to the homepage or explore our services.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild className="btn-gold px-8 h-11 rounded-xl w-full sm:w-auto">
              <Link href="/">
                <FaHome className="mr-2" />
                Go to Homepage
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-xl px-8 w-full sm:w-auto font-semibold"
              style={{ borderColor: "#d1d9e8", color: "#071B4A" }}
            >
              <Link href="/services">
                Our Services <FaArrowRight className="ml-2 text-xs" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

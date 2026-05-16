import { useTrackVisitor } from "@workspace/api-client-react";
import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "./pages/Home";
import Services from "./pages/Services";
import Apply from "./pages/Apply";
import Contact from "./pages/Contact";
import Updates from "./pages/Updates";
import UpdateDetail from "./pages/UpdateDetail";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Layout from "./components/Layout";
import LeadPopup from "./components/LeadPopup";

function forceLogout() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUsername");
  window.location.replace("/admin/login");
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: unknown) => {
      if ((error as { status?: number })?.status === 401) {
        queryClient.clear();
        forceLogout();
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error: unknown) => {
        if ((error as { status?: number })?.status === 401) return false;
        return failureCount < 2;
      },
    },
  },
});

function TrackVisitor() {
  const { mutate } = useTrackVisitor();
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      mutate();
    }
  }, [mutate]);

  return null;
}

function PageViewTracker() {
  const [location] = useLocation();
  const lastPage = useRef<string | null>(null);

  useEffect(() => {
    if (lastPage.current === location) return;
    lastPage.current = location;

    const isAdmin = location.startsWith("/admin");
    if (isAdmin) return;

    const device = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
      ? "mobile"
      : "desktop";

    fetch("/api/pageviews/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: location, device }),
    }).catch(() => {});
  }, [location]);

  return null;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services" component={Services} />
        <Route path="/updates" component={Updates} />
        <Route path="/updates/:slug" component={UpdateDetail} />
        <Route path="/apply" component={Apply} />
        <Route path="/contact" component={Contact} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <TrackVisitor />
            <PageViewTracker />
            <Router />
            <LeadPopup />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;

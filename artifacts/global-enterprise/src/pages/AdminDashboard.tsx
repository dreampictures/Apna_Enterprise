import { Fragment, useEffect, useState, useMemo, useRef, useCallback } from "react";
import Seo from "@/components/Seo";
import { useLocation } from "wouter";
import {
  useGetDashboardStats,
  getGetDashboardStatsQueryKey,
  useListApplications,
  getListApplicationsQueryKey,
  useExportApplicationsCsv,
  getExportApplicationsCsvQueryKey,
} from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FaSignOutAlt, FaFileDownload, FaUsers, FaClipboardList,
  FaFilter, FaBuilding, FaEye, FaTag, FaWhatsapp,
  FaMobileAlt, FaDesktop, FaChartBar, FaPhoneAlt, FaBullhorn,
  FaCheck, FaHourglassHalf, FaBook, FaMoneyBillWave, FaFileAlt,
} from "react-icons/fa";
import { SERVICE_CATEGORIES, SERVICE_TO_CATEGORY, ALL_SERVICE_IDS } from "@/lib/services";
import AdminAnnouncements from "./AdminAnnouncements";

const CATEGORY_BADGE: Record<string, string> = {
  "Travel Services": "bg-blue-100 text-blue-700",
  "Document Services": "bg-emerald-100 text-emerald-700",
  "Online Form Services": "bg-violet-100 text-violet-700",
  "Digital & Print Services": "bg-amber-100 text-amber-700",
  "Financial Services": "bg-rose-100 text-rose-700",
  "Parcel Services": "bg-cyan-100 text-cyan-700",
};

type Lead = { id: number; name: string; phone: string; page: string; createdAt: string };
type PageSummary = { byPage: { page: string; count: number }[]; byDevice: { device: string; count: number }[]; total: number };

function useLeads(token: string | null) {
  return useQuery<{ leads: Lead[] }>({
    queryKey: ["leads"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch("/api/leads", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

function usePageSummary(token: string | null) {
  return useQuery<PageSummary>({
    queryKey: ["pageviews-summary"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch("/api/pageviews/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

type ServicePrice = { service: string; price: number; updatedAt: string };

function useServicePricing(token: string | null) {
  return useQuery<{ prices: ServicePrice[] }>({
    queryKey: ["service-pricing"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch("/api/admin/pricing", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load service pricing");
      return res.json();
    },
  });
}

type Tab = "applications" | "leads" | "analytics" | "pricing" | "updates";
type ApplicationFolder = "all" | "pending" | "review" | "in_progress" | "completed" | "rejected";

const APPLICATION_FOLDERS: Array<{ id: ApplicationFolder; label: string }> = [
  { id: "pending", label: "Pending" },
  { id: "review", label: "Under Review" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All Applications" },
];

function applicationFolderForStatus(status: string): ApplicationFolder {
  if (status === "review") return "review";
  if (status === "applying" || status === "applied") return "in_progress";
  if (status === "completed") return "completed";
  if (status === "rejected") return "rejected";
  return "pending";
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [applicationFolder, setApplicationFolder] = useState<ApplicationFolder>("pending");
  const [activeTab, setActiveTab] = useState<Tab>("applications");
  const queryClient = useQueryClient();

  const token = localStorage.getItem("adminToken");

  function isTokenExpired(t: string): boolean {
    try {
      const payload = JSON.parse(atob(t.split(".")[1]));
      return typeof payload.exp === "number" && payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  useEffect(() => {
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUsername");
      setLocation("/admin/login");
    }
  }, [setLocation, token]);

  // Auto-logout after 1 hour of inactivity
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const INACTIVITY_MS = 60 * 60 * 1000;
    const reset = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUsername");
        setLocation("/admin/login");
      }, INACTIVITY_MS);
    };
    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [setLocation]);

  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() },
  });

  const listParams = serviceFilter
    ? { service: serviceFilter, limit: 500, offset: 0 }
    : { limit: 500, offset: 0 };
  const { data: applicationsData, isLoading: appsLoading } = useListApplications(listParams, {
    query: { queryKey: getListApplicationsQueryKey(listParams) },
  });

  const exportCsvParams = serviceFilter ? { service: serviceFilter } : {};
  const { refetch: fetchCsv, isFetching: exportLoading } = useExportApplicationsCsv(exportCsvParams, {
    query: { queryKey: getExportApplicationsCsvQueryKey(exportCsvParams), enabled: false },
  });

  const { data: leadsData, isLoading: leadsLoading } = useLeads(token);
  const { data: pageData, isLoading: pageLoading } = usePageSummary(token);
  const { data: pricingData, isLoading: pricingLoading } = useServicePricing(token);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [pricingError, setPricingError] = useState("");
  const [expandedApplication, setExpandedApplication] = useState<number | null>(null);

  useEffect(() => {
    if (!pricingData?.prices) return;
    setPriceDrafts((current) => {
      const next = { ...current };
      for (const item of pricingData.prices) next[item.service] = String(item.price);
      return next;
    });
  }, [pricingData]);

  const pricingByService = useMemo(
    () => Object.fromEntries((pricingData?.prices ?? []).map((item) => [item.service, item.price])) as Record<string, number>,
    [pricingData]
  );

   type AppStatus = "pending" | "review" | "applying" | "applied" | "rejected" | "completed";
   const ALL_APP_STATUSES: AppStatus[] = ["pending", "review", "applying", "applied", "rejected", "completed"];

   const [appStatuses, setAppStatuses] = useState<Record<number, AppStatus>>({});
   useEffect(() => {
     if (!applicationsData?.applications) return;
     setAppStatuses((prev) => {
       const next = { ...prev };
       for (const a of applicationsData.applications) {
         if (!(a.id in next)) next[a.id] = ((a as any).status ?? "pending") as AppStatus;
       }
       return next;
     });
   }, [applicationsData]);

   const applicationsMatchingFilters = useMemo(() => {
    if (!applicationsData?.applications) return [];
    if (!categoryFilter) return applicationsData.applications;
    return applicationsData.applications.filter(
      (app) => SERVICE_TO_CATEGORY[app.service] === categoryFilter
    );
  }, [applicationsData, categoryFilter]);

  const folderCounts = useMemo(() => {
    const counts: Record<ApplicationFolder, number> = {
      all: applicationsMatchingFilters.length,
      pending: 0,
      review: 0,
      in_progress: 0,
      completed: 0,
      rejected: 0,
    };
    for (const app of applicationsMatchingFilters) {
      const folder = applicationFolderForStatus(String(appStatuses[app.id] ?? (app as any).status ?? "pending"));
      counts[folder] += 1;
    }
    return counts;
  }, [applicationsMatchingFilters, appStatuses]);

  const displayedApplications = useMemo(
    () => applicationsMatchingFilters.filter((app) => {
      if (applicationFolder === "all") return true;
      return applicationFolderForStatus(String(appStatuses[app.id] ?? (app as any).status ?? "pending")) === applicationFolder;
    }),
    [applicationsMatchingFilters, applicationFolder, appStatuses]
  );

  const STATUS_STYLE: Record<AppStatus, { bg: string; color: string; border: string; label: string }> = {
    pending:   { bg: "#fef3c7", color: "#92400e", border: "#fcd34d", label: "Pending" },
    review:    { bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd", label: "Under Review" },
    applying:  { bg: "#ede9fe", color: "#7c3aed", border: "#c4b5fd", label: "In Progress" },
    applied:   { bg: "#d1fae5", color: "#065f46", border: "#6ee7b7", label: "Applied" },
    rejected:  { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5", label: "Rejected" },
    completed: { bg: "#dcfce7", color: "#14532d", border: "#86efac", label: "Completed ✓" },
  };

  const updateStatus = useCallback(async (id: number, newStatus: AppStatus) => {
    const prev = appStatuses[id];
    setAppStatuses((s) => ({ ...s, [id]: newStatus }));
    try {
      const response = await fetch(`/api/applications/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Could not update status");
      }
      await queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey(listParams) });
    } catch {
      setAppStatuses((s) => ({ ...s, [id]: prev }));
    }
  }, [token, appStatuses, queryClient, listParams]);

  async function handleExport() {
    const result = await fetchCsv();
    if (result.data) {
      const blob = new Blob([result.data as unknown as string], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `applications${serviceFilter ? `-${serviceFilter}` : ""}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  async function saveServicePrice(service: string) {
    const rawPrice = priceDrafts[service]?.trim() ?? "";
    if (!/^\d+$/.test(rawPrice)) {
      setPricingError(`Enter a valid price for ${service}.`);
      return;
    }

    setPricingError("");
    try {
      const res = await fetch(`/api/admin/pricing/${encodeURIComponent(service)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ price: Number(rawPrice) }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Could not save price");
      }
      await queryClient.invalidateQueries({ queryKey: ["service-pricing"] });
    } catch (error) {
      setPricingError(error instanceof Error ? error.message : "Could not save price");
    }
  }

  function handleLogout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUsername");
    queryClient.clear();
    setLocation("/admin/login");
  }

  function handleCategoryChange(val: string) {
    setCategoryFilter(val === "__all__" ? "" : val);
    setServiceFilter("");
  }

  function handleServiceChange(val: string) {
    setServiceFilter(val === "__all__" ? "" : val);
    setCategoryFilter("");
  }

  const username = localStorage.getItem("adminUsername") ?? "Admin";

  const PAGE_LABELS: Record<string, string> = {
    "/": "Home",
    "/services": "Services",
    "/apply": "Apply Now",
    "/contact": "Contact Us",
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Seo title="Admin Dashboard" description="Apna Enterprise admin dashboard." noindex={true} />
      {/* Admin Header */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <FaBuilding className="text-2xl" />
              <div>
                <span className="font-bold text-lg">Apna Enterprise</span>
                <span className="text-primary-foreground/70 text-xs ml-2">Admin Panel</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-primary-foreground/80 hidden sm:block">
                Welcome, <strong>{username}</strong>
              </span>
              <a
                href="/khaata"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                style={{ background: "#D4A017", color: "#071B4A" }}
                title="Khaata Book kholo"
              >
                <FaBook className="text-sm" />
                <span className="hidden sm:inline">Khaata Book</span>
              </a>
              <a
                href="/cameti"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                style={{ background: "#16a34a", color: "white" }}
                title="Daily Cameti kholo"
              >
                <FaUsers className="text-sm" />
                <span className="hidden sm:inline">Cameti</span>
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 gap-2"
              >
                <FaSignOutAlt />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 lg:px-8 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={FaClipboardList}
            label="Applications"
            value={statsLoading ? null : (stats?.totalApplications ?? 0)}
            color="bg-primary/10 text-primary"
          />
          <StatCard
            icon={FaEye}
            label="Total Visitors"
            value={statsLoading ? null : (stats?.visitorCount ?? 0)}
            color="bg-green-100 text-green-700"
          />
          <StatCard
            icon={FaPhoneAlt}
            label="Leads Captured"
            value={statsLoading ? null : ((stats as any)?.totalLeads ?? 0)}
            color="bg-amber-100 text-amber-700"
          />
          <StatCard
            icon={FaUsers}
            label="Services"
            value={ALL_SERVICE_IDS.length}
            color="bg-violet-100 text-violet-700"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm border border-slate-100 w-fit flex-wrap">
          {(["applications", "leads", "analytics", "pricing", "updates"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab === "applications" && <FaClipboardList className="inline mr-2 text-xs" />}
              {tab === "leads" && <FaPhoneAlt className="inline mr-2 text-xs" />}
              {tab === "analytics" && <FaChartBar className="inline mr-2 text-xs" />}
              {tab === "pricing" && <FaMoneyBillWave className="inline mr-2 text-xs" />}
              {tab === "updates" && <FaBullhorn className="inline mr-2 text-xs" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Applications Tab ── */}
        {activeTab === "applications" && (
          <>
            {/* Service Breakdown */}
            {!statsLoading && stats?.applicationsByService && stats.applicationsByService.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 mb-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Applications by Service</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {stats.applicationsByService.map((item) => (
                    <div key={item.service} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                      <span className="text-sm text-slate-700 font-medium truncate mr-2">{item.service}</span>
                      <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex-shrink-0">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Applications Table */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {APPLICATION_FOLDERS.find((folder) => folder.id === applicationFolder)?.label ?? "Applications"}
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Keep every submitted form here; move it between folders using its status.
                      </p>
                    </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <FaTag className="text-slate-400 text-sm" />
                      <Select value={categoryFilter || "__all__"} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="w-44 h-9 text-sm">
                          <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All Categories</SelectItem>
                          {SERVICE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <FaFilter className="text-slate-400 text-sm" />
                      <Select value={serviceFilter || "__all__"} onValueChange={handleServiceChange}>
                        <SelectTrigger className="w-52 h-9 text-sm">
                          <SelectValue placeholder="Filter by service" />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          <SelectItem value="__all__">All Services</SelectItem>
                          {SERVICE_CATEGORIES.map((cat) => (
                            <div key={cat.id}>
                              <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                                {cat.name}
                              </div>
                              {cat.services.map((s) => (
                                <SelectItem key={s.id} value={s.id} className="pl-5 text-sm">
                                  {s.name}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleExport}
                      disabled={exportLoading}
                      className="gap-2 h-9"
                    >
                      <FaFileDownload className="text-sm" />
                      {exportLoading ? "Exporting..." : "Export CSV"}
                    </Button>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  {APPLICATION_FOLDERS.map((folder) => {
                    const selected = applicationFolder === folder.id;
                    return (
                      <button
                        key={folder.id}
                        type="button"
                        onClick={() => setApplicationFolder(folder.id)}
                        className={`inline-flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors sm:justify-center ${
                          selected
                            ? "border-primary bg-primary text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:bg-primary/5"
                        }`}
                      >
                        <span>{folder.label}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                          selected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                        }`}>
                          {folderCounts[folder.id]}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {(categoryFilter || serviceFilter) && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <span>Filtering by:</span>
                    {categoryFilter && (
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        Category: {categoryFilter}
                      </span>
                    )}
                    {serviceFilter && (
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        Service: {serviceFilter}
                      </span>
                    )}
                    <button
                      onClick={() => { setCategoryFilter(""); setServiceFilter(""); }}
                      className="text-slate-400 hover:text-slate-600 underline"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <div>
                {appsLoading ? (
                  <div className="p-6 space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                ) : !displayedApplications.length ? (
                  <div className="py-16 text-center text-slate-500">
                    <FaClipboardList className="text-4xl mx-auto mb-3 text-slate-300" />
                    <p className="font-medium">No applications found</p>
                    <p className="text-sm mt-1">
                      {categoryFilter || serviceFilter
                        ? "Try changing or clearing the filters."
                        : "Applications submitted through the website will appear here."}
                    </p>
                  </div>
                ) : (
                   <>
                     {/* Cards keep every application field visible on tablets and phones. */}
                      <div className="space-y-3 p-4">
                       {displayedApplications.map((app) => {
                         const catName = SERVICE_TO_CATEGORY[app.service] ?? "Other";
                         const st = (appStatuses[app.id] ?? (app as any).status ?? "pending") as typeof ALL_APP_STATUSES[number];
                         const stStyle = STATUS_STYLE[st] ?? STATUS_STYLE.pending;
                         const callbackReq = (app as any).callbackRequested;
                         const paymentStatus = String((app as any).paymentStatus ?? "not_required");
                         const paymentPaid = paymentStatus === "paid";
                         const paymentAmount = Number((app as any).paymentAmount ?? 0);
                         return (
                           <article key={app.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                             <div className="flex items-start justify-between gap-3">
                               <div className="min-w-0">
                                 <h3 className="font-bold text-slate-900 break-words">{app.name}</h3>
                                 <p className="mt-1 text-xs font-medium text-primary">{app.service}</p>
                                 <p className="mt-1 text-xs text-slate-400">{catName}</p>
                               </div>
                               {paymentPaid ? (
                                 <span className="inline-flex shrink-0 flex-col gap-0.5 rounded-lg bg-green-50 border border-green-200 px-2 py-1 text-xs font-semibold text-green-700">
                                   <span className="inline-flex items-center gap-1"><FaCheck className="text-[10px]" /> Paid</span>
                                   <span className="font-normal text-green-700/80">₹{paymentAmount.toFixed(2)}</span>
                                 </span>
                               ) : (
                                 <span className={`inline-flex shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${
                                   paymentStatus === "failed"
                                     ? "bg-red-50 text-red-700 border border-red-200"
                                     : paymentStatus === "initiated"
                                       ? "bg-amber-50 text-amber-700 border border-amber-200"
                                       : "bg-slate-100 text-slate-500 border border-slate-200"
                                 }`}>
                                   {paymentStatus === "failed" ? "Failed" : paymentStatus === "initiated" ? "Pending" : "Not required"}
                                 </span>
                               )}
                             </div>

                             <dl className="mt-4 grid grid-cols-1 gap-3 border-y border-slate-100 py-3 sm:grid-cols-2">
                               <div>
                                 <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tracking #</dt>
                                 <dd className="mt-1 break-all font-mono text-xs text-slate-700">{(app as any).trackingNumber ?? "—"}</dd>
                               </div>
                               <div>
                                 <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</dt>
                                 <dd className="mt-1 text-sm text-slate-700">{app.phone}</dd>
                               </div>
                              <div>
                                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</dt>
                                <dd className="mt-1 break-words text-sm text-slate-700">{(app as any).email ?? "—"}</dd>
                              </div>
                               <div>
                                 <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</dt>
                                 <dd className="mt-1 text-sm text-slate-700">
                                   {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                 </dd>
                               </div>
                               <div>
                                 <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Callback</dt>
                                 <dd className="mt-1">
                                   {callbackReq ? (
                                     <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700"><FaPhoneAlt className="text-[10px]" /> Yes</span>
                                   ) : (
                                     <span className="text-sm text-slate-300">—</span>
                                   )}
                                 </dd>
                               </div>
                             </dl>

                             <div className="mt-3">
                               <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Message</p>
                               <p className="mt-1 break-words text-sm text-slate-600">{app.message ?? <span className="text-slate-300 italic">—</span>}</p>
                             </div>

                              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-800">
                                  {app.service} — complete submitted form
                                </p>
                                <ApplicationDetails raw={(app as any).details} price={pricingByService[app.service]} />
                              </div>

                              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                               <select
                                 value={st}
                                 onChange={(e) => updateStatus(app.id, e.target.value as typeof ALL_APP_STATUSES[number])}
                                 className="min-w-0 flex-1 rounded-lg border-2 px-3 py-2 text-xs font-bold focus:outline-none"
                                 style={{ background: stStyle.bg, color: stStyle.color, borderColor: stStyle.border }}
                               >
                                 {ALL_APP_STATUSES.map((s) => (
                                   <option key={s} value={s} style={{ background: "white", color: "#1e293b" }}>
                                     {STATUS_STYLE[s].label}
                                   </option>
                                 ))}
                               </select>
                             </div>
                           </article>
                         );
                       })}
                     </div>

                      <div className="hidden">
                       <table className="w-full text-sm">
                         <thead>
                           <tr className="bg-slate-50 border-b border-slate-100">
                             <th className="text-left py-3 px-4 font-semibold text-slate-600 uppercase tracking-wider text-xs">Name</th>
                             <th className="text-left py-3 px-4 font-semibold text-slate-600 uppercase tracking-wider text-xs hidden sm:table-cell">Tracking #</th>
                             <th className="text-left py-3 px-4 font-semibold text-slate-600 uppercase tracking-wider text-xs">Phone</th>
                             <th className="text-left py-3 px-4 font-semibold text-slate-600 uppercase tracking-wider text-xs hidden lg:table-cell">Service</th>
                             <th className="text-left py-3 px-4 font-semibold text-slate-600 uppercase tracking-wider text-xs hidden xl:table-cell">Message</th>
                             <th className="text-left py-3 px-4 font-semibold text-slate-600 uppercase tracking-wider text-xs">Details</th>
                             <th className="text-left py-3 px-4 font-semibold text-slate-600 uppercase tracking-wider text-xs hidden md:table-cell">Callback</th>
                             <th className="text-left py-3 px-4 font-semibold text-slate-600 uppercase tracking-wider text-xs hidden lg:table-cell">Date</th>
                             <th className="text-left py-3 px-4 font-semibold text-slate-600 uppercase tracking-wider text-xs">Payment</th>
                             <th className="text-left py-3 px-4 font-semibold text-slate-600 uppercase tracking-wider text-xs">Status</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                           {displayedApplications.map((app) => {
                             const catName = SERVICE_TO_CATEGORY[app.service] ?? "Other";
                             const st = (appStatuses[app.id] ?? (app as any).status ?? "pending") as typeof ALL_APP_STATUSES[number];
                             const stStyle = STATUS_STYLE[st] ?? STATUS_STYLE.pending;
                             const callbackReq = (app as any).callbackRequested;
                             const paymentStatus = String((app as any).paymentStatus ?? "not_required");
                             const paymentPaid = paymentStatus === "paid";
                             const paymentAmount = Number((app as any).paymentAmount ?? 0);
                             return (
                               <Fragment key={app.id}>
                                 <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                                   <td className="py-3 px-4">
                                     <div className="font-medium text-slate-900 text-sm">{app.name}</div>
                                     <div className="text-xs text-slate-400 lg:hidden">{catName}</div>
                                   </td>
                                   <td className="py-3 px-4 hidden sm:table-cell">
                                     <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded tracking-wider">
                                       {(app as any).trackingNumber ?? "—"}
                                     </span>
                                   </td>
                                   <td className="py-3 px-4 text-slate-700 text-sm whitespace-nowrap">{app.phone}</td>
                                   <td className="py-3 px-4 hidden lg:table-cell">
                                     <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap">
                                       {app.service}
                                     </span>
                                   </td>
                                   <td className="py-3 px-4 text-slate-500 hidden xl:table-cell max-w-xs truncate text-sm">
                                     {app.message ?? <span className="text-slate-300 italic">—</span>}
                                   </td>
                                   <td className="py-3 px-4">
                                     <button
                                       type="button"
                                       onClick={() => setExpandedApplication(expandedApplication === app.id ? null : app.id)}
                                       className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
                                     >
                                       <FaFileAlt className="text-xs" />
                                       {expandedApplication === app.id ? "Hide" : "View"}
                                     </button>
                                   </td>
                                   <td className="py-3 px-4 hidden md:table-cell">
                                     {callbackReq ? (
                                       <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                         <FaPhoneAlt className="text-xs" /> Yes
                                       </span>
                                     ) : (
                                       <span className="text-xs text-slate-300 italic">—</span>
                                     )}
                                   </td>
                                   <td className="py-3 px-4 text-slate-500 hidden lg:table-cell whitespace-nowrap text-sm">
                                     {new Date(app.createdAt).toLocaleDateString("en-IN", {
                                       day: "numeric", month: "short", year: "numeric",
                                     })}
                                   </td>
                                   <td className="py-3 px-4 whitespace-nowrap">
                                     {paymentPaid ? (
                                       <span className="inline-flex flex-col gap-0.5 rounded-lg bg-green-50 border border-green-200 px-2 py-1 text-xs font-semibold text-green-700">
                                         <span className="inline-flex items-center gap-1"><FaCheck className="text-[10px]" /> Paid</span>
                                         <span className="font-normal text-green-700/80">₹{paymentAmount.toFixed(2)}</span>
                                       </span>
                                     ) : (
                                       <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                         paymentStatus === "failed"
                                           ? "bg-red-50 text-red-700 border border-red-200"
                                           : paymentStatus === "initiated"
                                             ? "bg-amber-50 text-amber-700 border border-amber-200"
                                             : "bg-slate-100 text-slate-500 border border-slate-200"
                                       }`}>
                                         {paymentStatus === "failed" ? "Failed" : paymentStatus === "initiated" ? "Pending" : "Not required"}
                                       </span>
                                     )}
                                   </td>
                                   <td className="py-3 px-4 whitespace-nowrap">
                                     <select
                                       value={st}
                                       onChange={(e) => updateStatus(app.id, e.target.value as typeof ALL_APP_STATUSES[number])}
                                       className="text-xs font-bold px-2 py-1.5 rounded-full border-2 cursor-pointer transition-all duration-150 hover:opacity-80 focus:outline-none"
                                       style={{ background: stStyle.bg, color: stStyle.color, borderColor: stStyle.border }}
                                     >
                                       {ALL_APP_STATUSES.map((s) => (
                                         <option key={s} value={s} style={{ background: "white", color: "#1e293b" }}>
                                           {STATUS_STYLE[s].label}
                                         </option>
                                       ))}
                                     </select>
                                   </td>
                                 </tr>
                                 {expandedApplication === app.id && (
                                   <tr key={`${app.id}-details`} className="bg-amber-50/60">
                                     <td colSpan={10} className="px-4 py-4">
                                       <div className="rounded-xl border border-amber-200 bg-white p-4">
                                         <p className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-3">
                                           {app.service} — client details
                                         </p>
                                         <ApplicationDetails raw={(app as any).details} price={pricingByService[app.service]} />
                                       </div>
                                     </td>
                                   </tr>
                                 )}
                               </Fragment>
                             );
                           })}
                         </tbody>
                       </table>
                     </div>
                   </>
                )}
              </div>

              {applicationsData && (
                <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-500 bg-slate-50">
                  Showing {displayedApplications.length} of {folderCounts.all} filtered application
                  {folderCounts.all !== 1 ? "s" : ""} in this folder
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Leads Tab ── */}
        {activeTab === "leads" && (
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Captured Leads</h2>
              <p className="text-sm text-slate-500 mt-1">
                Visitors who requested a callback. Click the WhatsApp button to contact them directly.
              </p>
            </div>

            <div className="overflow-x-auto">
              {leadsLoading ? (
                <div className="p-6 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : !leadsData?.leads?.length ? (
                <div className="py-16 text-center text-slate-500">
                  <FaPhoneAlt className="text-4xl mx-auto mb-3 text-slate-300" />
                  <p className="font-medium">No leads yet</p>
                  <p className="text-sm mt-1">
                    When visitors request a callback, they'll appear here.
                  </p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left py-3 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Name</th>
                      <th className="text-left py-3 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">WhatsApp</th>
                      <th className="text-left py-3 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs hidden sm:table-cell">From Page</th>
                      <th className="text-left py-3 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs hidden md:table-cell">Date</th>
                      <th className="text-left py-3 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {leadsData.leads.map((lead) => {
                      const digits = lead.phone.replace(/\D/g, "");
                      const waNumber = digits.startsWith("0") ? "91" + digits.slice(1) : digits.length === 10 ? "91" + digits : digits;
                      const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi ${lead.name}, this is Apna Enterprise. How can we help you today?`)}`;
                      return (
                        <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-6 font-medium text-slate-900">{lead.name}</td>
                          <td className="py-4 px-6 text-slate-700">{lead.phone}</td>
                          <td className="py-4 px-6 hidden sm:table-cell">
                            <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">
                              {PAGE_LABELS[lead.page] ?? lead.page}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-500 hidden md:table-cell whitespace-nowrap">
                            {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </td>
                          <td className="py-4 px-6">
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <FaWhatsapp />
                              WhatsApp
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {leadsData?.leads && leadsData.leads.length > 0 && (
              <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-500 bg-slate-50">
                {leadsData.leads.length} lead{leadsData.leads.length !== 1 ? "s" : ""} captured
              </div>
            )}
          </div>
        )}

        {/* ── Analytics Tab ── */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Page Views */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Page Views</h2>
              <p className="text-sm text-slate-500 mb-5">Total: <strong>{pageLoading ? "…" : (pageData?.total ?? 0)}</strong></p>
              {pageLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
                </div>
              ) : !pageData?.byPage?.length ? (
                <p className="text-slate-400 text-sm py-6 text-center">No page views recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {pageData.byPage.map((item) => {
                    const pct = pageData.total > 0 ? Math.round((item.count / pageData.total) * 100) : 0;
                    return (
                      <div key={item.page}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-700">{PAGE_LABELS[item.page] ?? item.page}</span>
                          <span className="text-slate-500">{item.count} <span className="text-slate-400">({pct}%)</span></span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Device Breakdown */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-5">Device Breakdown</h2>
              {pageLoading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                </div>
              ) : !pageData?.byDevice?.length ? (
                <p className="text-slate-400 text-sm py-6 text-center">No data yet.</p>
              ) : (
                <div className="space-y-4">
                  {pageData.byDevice.map((item) => {
                    const pct = pageData.total > 0 ? Math.round((item.count / pageData.total) * 100) : 0;
                    return (
                      <div key={item.device} className="flex items-center gap-4 bg-slate-50 rounded-xl p-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {item.device === "mobile"
                            ? <FaMobileAlt className="text-primary text-lg" />
                            : <FaDesktop className="text-primary text-lg" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-1">
                            <span className="font-semibold text-slate-800 capitalize">{item.device}</span>
                            <span className="text-sm text-slate-500">{item.count} views ({pct}%)</span>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Pricing Tab ── */}
        {activeTab === "pricing" && (
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                  <FaMoneyBillWave />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Service Pricing</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Set your internal price for each service. Prices are not shown to clients; use them while reviewing an application and calling back.
                  </p>
                </div>
              </div>
              {pricingError && (
                <p className="mt-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{pricingError}</p>
              )}
            </div>

            {pricingLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
              </div>
            ) : (
              <div className="p-6 space-y-8">
                {SERVICE_CATEGORIES.map((category) => (
                  <section key={category.id}>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">{category.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {category.services.map((service) => (
                        <div key={service.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                          <span className="text-sm font-medium text-slate-800 flex-1 min-w-0">{service.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-sm">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              inputMode="numeric"
                              value={priceDrafts[service.id] ?? ""}
                              onChange={(event) => setPriceDrafts((current) => ({ ...current, [service.id]: event.target.value }))}
                              placeholder="Not set"
                              className="w-24 h-9 rounded-lg border border-slate-300 px-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-amber-300"
                              aria-label={`Price for ${service.name}`}
                            />
                            <Button size="sm" onClick={() => saveServicePrice(service.id)} className="h-9 bg-primary hover:bg-primary/90">
                              Save
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Updates Tab ── */}
        {activeTab === "updates" && (
          <AdminAnnouncements token={token} />
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, color,
}: {
  icon: React.ElementType; label: string; value: number | null; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="text-xl" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium mb-0.5">{label}</p>
        {value === null ? (
          <Skeleton className="h-7 w-14 rounded" />
        ) : (
          <p className="text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}

function ApplicationDetails({ raw, price }: { raw?: string; price?: number }) {
  let details: Record<string, unknown> = {};
  try {
    const parsed = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      details = parsed as Record<string, unknown>;
    }
  } catch {
    return <p className="text-sm text-slate-500">The submitted details could not be read.</p>;
  }

  const entries = Object.entries(details).filter(([, value]) => value !== undefined && value !== "");
  if (!entries.length) {
    return <p className="text-sm text-slate-500">No service-specific details were submitted.</p>;
  }

  return (
    <>
      <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Internal price for callback</span>
        <span className="text-lg font-extrabold text-amber-900">{price === undefined ? "Not set" : `₹${price.toLocaleString("en-IN")}`}</span>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
      {entries.map(([key, value]) => (
        <div key={key}>
          <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{humanizeDetailKey(key)}</dt>
          <dd className="text-sm text-slate-800 mt-0.5 whitespace-pre-wrap break-words">{formatDetailValue(value)}</dd>
        </div>
      ))}
      </dl>
    </>
  );
}

function humanizeDetailKey(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (value) => value.toUpperCase());
}

function formatDetailValue(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

const PAGE_LABELS: Record<string, string> = {
  "/": "Home",
  "/services": "Services",
  "/apply": "Apply Now",
  "/contact": "Contact Us",
};

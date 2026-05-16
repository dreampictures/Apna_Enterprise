import { useEffect, useState, useMemo } from "react";
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

type Tab = "applications" | "leads" | "analytics" | "updates";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
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

  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() },
  });

  const listParams = serviceFilter ? { service: serviceFilter } : {};
  const { data: applicationsData, isLoading: appsLoading } = useListApplications(listParams, {
    query: { queryKey: getListApplicationsQueryKey(listParams) },
  });

  const exportCsvParams = serviceFilter ? { service: serviceFilter } : {};
  const { refetch: fetchCsv, isFetching: exportLoading } = useExportApplicationsCsv(exportCsvParams, {
    query: { queryKey: getExportApplicationsCsvQueryKey(exportCsvParams), enabled: false },
  });

  const { data: leadsData, isLoading: leadsLoading } = useLeads(token);
  const { data: pageData, isLoading: pageLoading } = usePageSummary(token);

  const displayedApplications = useMemo(() => {
    if (!applicationsData?.applications) return [];
    if (!categoryFilter) return applicationsData.applications;
    return applicationsData.applications.filter(
      (app) => SERVICE_TO_CATEGORY[app.service] === categoryFilter
    );
  }, [applicationsData, categoryFilter]);

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
            <div className="flex items-center gap-4">
              <span className="text-sm text-primary-foreground/80 hidden sm:block">
                Welcome, <strong>{username}</strong>
              </span>
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
          {(["applications", "leads", "analytics", "updates"] as Tab[]).map((tab) => (
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
                  <h2 className="text-lg font-bold text-slate-900">All Applications</h2>
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

              <div className="overflow-x-auto">
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
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left py-3 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Name</th>
                        <th className="text-left py-3 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Phone</th>
                        <th className="text-left py-3 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Category</th>
                        <th className="text-left py-3 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs">Service</th>
                        <th className="text-left py-3 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs hidden md:table-cell">Message</th>
                        <th className="text-left py-3 px-6 font-semibold text-slate-600 uppercase tracking-wider text-xs hidden lg:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {displayedApplications.map((app) => {
                        const catName = SERVICE_TO_CATEGORY[app.service] ?? "Other";
                        const badgeClass = CATEGORY_BADGE[catName] ?? "bg-slate-100 text-slate-600";
                        return (
                          <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-6 font-medium text-slate-900">{app.name}</td>
                            <td className="py-4 px-6 text-slate-700">{app.phone}</td>
                            <td className="py-4 px-6">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${badgeClass}`}>
                                {catName}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                                {app.service}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-slate-500 hidden md:table-cell max-w-xs truncate">
                              {app.message ?? <span className="text-slate-300 italic">—</span>}
                            </td>
                            <td className="py-4 px-6 text-slate-500 hidden lg:table-cell whitespace-nowrap">
                              {new Date(app.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric", month: "short", year: "numeric",
                              })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {applicationsData && (
                <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-500 bg-slate-50">
                  Showing {displayedApplications.length} of {applicationsData.total} application
                  {applicationsData.total !== 1 ? "s" : ""}
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

const PAGE_LABELS: Record<string, string> = {
  "/": "Home",
  "/services": "Services",
  "/apply": "Apply Now",
  "/contact": "Contact Us",
};

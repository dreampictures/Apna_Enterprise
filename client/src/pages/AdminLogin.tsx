import { useForm } from "react-hook-form";
import Seo from "@/components/Seo";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FaLock, FaShieldAlt } from "react-icons/fa";
import { useEffect } from "react";
import logoImg from "/logo.png";

const GOLD = "#D4A017";
const GOLD_LIGHT = "#F2C14E";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const adminLogin = useAdminLogin();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setLocation("/admin/dashboard");
    }
  }, [setLocation]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", password: "" },
  });

  function onSubmit(values: FormValues) {
    adminLogin.mutate(
      { data: { username: values.username, password: values.password } },
      {
        onSuccess: (data) => {
          localStorage.setItem("adminToken", data.token);
          localStorage.setItem("adminUsername", data.username);
          setLocation("/admin/dashboard");
        },
      }
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4"
      style={{ background: "linear-gradient(135deg, #050D24 0%, #071B4A 60%, #0d2069 100%)" }}
    >
      <Seo title="Admin Login" description="Apna Enterprise admin login." noindex={true} />
      {/* Background radial glow */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 30%, rgba(212,160,23,0.07) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Gold top line */}
        <div className="gold-line w-20 mx-auto mb-8" />

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-5">
            <img src={logoImg} alt="Apna Enterprise" className="h-16 w-16 object-contain drop-shadow-xl" />
            <div className="text-left">
              <span className="font-extrabold text-2xl text-white block tracking-wide">Apna Enterprise</span>
              <span className="text-xs font-semibold tracking-widest" style={{ color: GOLD_LIGHT }}>
                ADMIN PORTAL
              </span>
            </div>
          </div>

          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(212,160,23,0.12)", border: "1px solid rgba(212,160,23,0.25)" }}
          >
            <FaLock style={{ color: GOLD, fontSize: "1.6rem" }} />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Secure Login</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            Sign in to access the admin panel
          </p>
        </div>

        {/* Glass Form Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
          }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="off"
                        className="h-11 rounded-xl text-slate-900"
                        style={{ background: "rgba(255,255,255,0.92)", border: "1.5px solid rgba(255,255,255,0.2)" }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="h-11 rounded-xl text-slate-900"
                        style={{ background: "rgba(255,255,255,0.92)", border: "1.5px solid rgba(255,255,255,0.2)" }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {adminLogin.isError && (
                <div
                  className="text-sm rounded-xl p-3 text-center font-medium"
                  style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}
                >
                  Invalid username or password. Please try again.
                </div>
              )}

              <Button
                type="submit"
                className="btn-gold w-full h-12 text-base rounded-xl mt-1"
                disabled={adminLogin.isPending}
              >
                {adminLogin.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6" style={{ color: "rgba(255,255,255,0.3)" }}>
          <FaShieldAlt className="text-xs" />
          <p className="text-xs">This area is restricted to authorised administrators only.</p>
        </div>
      </div>
    </div>
  );
}

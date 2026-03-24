import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./hooks/useTheme";
import { LanguageProvider } from "./hooks/useLanguage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Skeleton } from "./components/ui/skeleton";

const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ScanHistory = lazy(() => import("./pages/ScanHistory"));
const Scan = lazy(() => import("./pages/Scan"));
const BatchScan = lazy(() => import("./pages/BatchScan"));
const DesignHistory = lazy(() => import("./pages/DesignHistory"));
const Pricing = lazy(() => import("./pages/Pricing"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminReports = lazy(() => import("./pages/AdminReports"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Terms = lazy(() => import("./pages/Terms"));
const DMCA = lazy(() => import("./pages/DMCA"));
const Privacy = lazy(() => import("./pages/Privacy"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function PageLoader() {
  return (
    <div className="container py-8 space-y-4" role="status" aria-label="Loading page">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-lg" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <ErrorBoundary>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
                      <Route path="/batch-scan" element={<ProtectedRoute><BatchScan /></ProtectedRoute>} />
                      <Route path="/scan-history" element={<ProtectedRoute><ScanHistory /></ProtectedRoute>} />
                      <Route path="/design-history" element={<ProtectedRoute><DesignHistory /></ProtectedRoute>} />
                      <Route path="/admin/reports" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/dmca" element={<DMCA />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </Layout>
              </BrowserRouter>
            </ErrorBoundary>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { LeaderboardProvider } from "@/context/LeaderboardContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Lazy load pages for performance
const Landing = lazy(() => import("@/pages/Landing"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));
const UpdateScore = lazy(() => import("@/pages/UpdateScore"));
const TeamEntry = lazy(() => import("@/pages/TeamEntry"));
const TeamDetails = lazy(() => import("@/pages/TeamDetails"));
const Login = lazy(() => import("@/pages/Login"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("@/pages/TermsConditions"));

// Tactical Loading Fallback
const PageLoader = () => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-center p-4">
    <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
    <p className="text-yellow-500 font-teko text-xl tracking-[0.2em] animate-pulse uppercase">Initializing System...</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <LeaderboardProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />

              {/* Admin Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/leaderboard/update" element={<UpdateScore />} />
                <Route path="/admin/entry" element={<TeamEntry />} />
                <Route path="/admin/teams" element={<TeamDetails />} />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </LeaderboardProvider>
    </AuthProvider>
  );
}

export default App;
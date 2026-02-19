import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import Leaderboard from "@/pages/Leaderboard";
import Admin from "@/pages/Admin";
import TeamEntry from "@/pages/TeamEntry";
import TeamDetails from "@/pages/TeamDetails";
import { LeaderboardProvider } from "@/context/LeaderboardContext";

function App() {
  return (
    <LeaderboardProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/entry" element={<TeamEntry />} />
          <Route path="/teams" element={<TeamDetails />} />
        </Routes>
      </Router>
    </LeaderboardProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PullRequestReport from './pages/PullRequestReport';

import Repositories from './pages/Repositories';
import PullRequests from './pages/PullRequests';
import Vulnerabilities from './pages/Vulnerabilities';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col relative">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pr/:id" element={<PullRequestReport />} />
              <Route path="/repos" element={<Repositories />} />
              <Route path="/prs" element={<PullRequests />} />
              <Route path="/vulns" element={<Vulnerabilities />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;

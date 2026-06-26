import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import CitizenLayout from './layouts/CitizenLayout';
import AdminLayout from './layouts/AdminLayout';
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import CitizenDashboard from './pages/citizen/Dashboard';
import Profile from './pages/citizen/Profile';
import EditProfile from './pages/citizen/EditProfile';
import SubmitLetter from './pages/citizen/SubmitLetter';
import SubmitQueue from './pages/citizen/SubmitQueue';
import SubmitComplaint from './pages/citizen/SubmitComplaint';
import History from './pages/citizen/History';
import AdminDashboard from './pages/admin/Dashboard';
import ManageResidents from './pages/admin/ManageResidents';
import ResidentDetail from './pages/admin/ResidentDetail';
import ManageAdmins from './pages/admin/ManageAdmins';
import ManageLetters from './pages/admin/ManageLetters';
import ManageQueues from './pages/admin/ManageQueues';
import ManageComplaints from './pages/admin/ManageComplaints';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/warga/dashboard'} />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
      </Route>

      <Route path="/warga" element={<ProtectedRoute role="warga"><CitizenLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<CitizenDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="edit-profile" element={<EditProfile />} />
        <Route path="submit-letter" element={<SubmitLetter />} />
        <Route path="submit-queue" element={<SubmitQueue />} />
        <Route path="submit-complaint" element={<SubmitComplaint />} />
        <Route path="history" element={<History />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="residents" element={<ManageResidents />} />
        <Route path="residents/:id" element={<ResidentDetail />} />
        <Route path="admins" element={<ManageAdmins />} />
        <Route path="letters" element={<ManageLetters />} />
        <Route path="queues" element={<ManageQueues />} />
        <Route path="complaints" element={<ManageComplaints />} />
      </Route>
    </Routes>
  );
}

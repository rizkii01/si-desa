import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import App from './App.jsx'
import PublicLayout from './layouts/PublicLayout'
import CitizenLayout from './layouts/CitizenLayout'
import AdminLayout from './layouts/AdminLayout'
import Landing from './pages/public/Landing'
import Login from './pages/public/Login'
import CitizenDashboard from './pages/citizen/Dashboard'
import Profile from './pages/citizen/Profile'
import EditProfile from './pages/citizen/EditProfile'
import SubmitQueue from './pages/citizen/SubmitQueue'
import SubmitComplaint from './pages/citizen/SubmitComplaint'
import ComplaintDetail from './pages/citizen/ComplaintDetail'
import History from './pages/citizen/History'
import SmartSubmitLetter from './pages/citizen/SmartSubmitLetter'
import SmartLetterHistory from './pages/citizen/SmartLetterHistory'
import Notifications from './pages/citizen/Notifications'
import AdminDashboard from './pages/admin/Dashboard'
import ManageResidents from './pages/admin/ManageResidents'
import ResidentDetail from './pages/admin/ResidentDetail'
import ManageAdmins from './pages/admin/ManageAdmins'
import ManageQueues from './pages/admin/ManageQueues'
import ManageComplaints from './pages/admin/ManageComplaints'
import AdminComplaintDetail from './pages/admin/AdminComplaintDetail'
import ManageSmartLetters from './pages/admin/ManageSmartLetters'
import SmartLetterDetail from './pages/admin/SmartLetterDetail'
import AdminNotifications from './pages/admin/AdminNotifications'
import './index.css'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>
  if (!user) return <Navigate to="/login" />
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/warga/dashboard'} />
  return children
}

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: '/', element: <Landing /> },
          { path: '/login', element: <Login /> },
        ],
      },
      {
        path: '/warga',
        element: <ProtectedRoute role="warga"><CitizenLayout /></ProtectedRoute>,
        children: [
          { index: true, element: <Navigate to="dashboard" /> },
          { path: 'dashboard', element: <CitizenDashboard /> },
          { path: 'profile', element: <Profile /> },
          { path: 'edit-profile', element: <EditProfile /> },
          { path: 'submit-queue', element: <SubmitQueue /> },
          { path: 'submit-complaint', element: <SubmitComplaint /> },
          { path: 'complaints/:id', element: <ComplaintDetail /> },
          { path: 'history', element: <History /> },
          { path: 'smart-submit-letter', element: <SmartSubmitLetter /> },
          { path: 'smart-letters', element: <SmartLetterHistory /> },
          { path: 'notifications', element: <Notifications /> },
        ],
      },
      {
        path: '/admin',
        element: <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>,
        children: [
          { index: true, element: <Navigate to="dashboard" /> },
          { path: 'dashboard', element: <AdminDashboard /> },
          { path: 'residents', element: <ManageResidents /> },
          { path: 'residents/:id', element: <ResidentDetail /> },
          { path: 'admins', element: <ManageAdmins /> },
          { path: 'queues', element: <ManageQueues /> },
          { path: 'complaints', element: <ManageComplaints /> },
          { path: 'complaints/:id', element: <AdminComplaintDetail /> },
          { path: 'smart-letters', element: <ManageSmartLetters /> },
          { path: 'smart-letters/:id', element: <SmartLetterDetail /> },
          { path: 'notifications', element: <AdminNotifications /> },
        ],
      },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </AuthProvider>
  </StrictMode>,
)

import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "./context/AuthContext";

import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import CompaniesPage from "./pages/Companies";
import CompanyDetailsPage from "./pages/CompanyDetails";
import ExperiencePage from "./pages/allExperiences";
import CreateExperiencePage from "./pages/CreateExperience";
import NotFoundPage from "./pages/NotFound";
import ExperienceDetailsPage from "./pages/ExperienceDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import BookmarksPage from "./pages/Bookmarks";
import ProfilePage from "./pages/Profile";
import DashboardPage from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MessagesPage from "./pages/Messages";
import Layout from "./components/Layout/Layout";
import AdminRoute from "./components/AdminRoute";

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route 
          path="/" 
          element={
            user ? (
              user.role === "ADMIN" ? <Navigate to="/admin" /> : <DashboardPage />
            ) : (
              <HomePage />
            )
          } 
        />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/" /> : <RegisterPage />} 
        />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/companies/:id" element={<CompanyDetailsPage />} />
        <Route path="/get-experiences/:id" element={<ExperiencePage />} />
        <Route path="/experience/:id" element={<ExperienceDetailsPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/create-experience/:roleId" element={<CreateExperiencePage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/messages" element={<MessagesPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="/*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
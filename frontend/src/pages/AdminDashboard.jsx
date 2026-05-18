import { useEffect, useState } from "react";
import { 
  Users, 
  Building2, 
  Briefcase, 
  MessageSquare, 
  Shield, 
  Search, 
  MoreVertical,
  Activity,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Plus,
  X,
  Flag,
  TrendingUp
} from "lucide-react";
import api from "../services/api";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "../components/UI/Card";
import Button from "../components/UI/Button";
import Skeleton from "../components/UI/Skeleton";
import { cn } from "../utils/cn";
import { motion, AnimatePresence } from "framer-motion";

const TABS = [
  { id: "overview", label: "Overview", icon: <Activity size={18} /> },
  { id: "users", label: "Users", icon: <Users size={18} /> },
  { id: "experiences", label: "Experiences", icon: <Briefcase size={18} /> },
  { id: "companies", label: "Companies & Roles", icon: <Building2 size={18} /> },
  { id: "reports", label: "Reports", icon: <Flag size={18} /> },
];

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals / Forms state
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: "", logo: "", description: "", website: "" });
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState({ roleName: "", companyId: "" });
  const [moderateExp, setModerateExp] = useState(null); // { id, message }

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "overview") {
        const res = await api.get("/admin/stats");
        setStats(res.data);
      } else if (activeTab === "users") {
        const res = await api.get("/admin/users");
        setUsers(res.data);
      } else if (activeTab === "experiences") {
        const res = await api.get("/admin/experiences");
        setExperiences(res.data);
      } else if (activeTab === "companies") {
        const res = await api.get("/companies");
        setCompanies(res.data);
      } else if (activeTab === "reports") {
        const res = await api.get("/admin/reports");
        setReports(res.data);
      }
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.patch("/admin/users/role", { userId, role: newRole });
      fetchData();
    } catch (error) {
      alert("Failed to update role");
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/admin/users/${id}`);
        fetchData();
      } catch (error) {
        alert("Failed to delete user");
      }
    }
  };

  const handleModerate = async (id, status, message) => {
    try {
      await api.patch(`/admin/experiences/${id}/moderate`, { status, message });
      setModerateExp(null);
      fetchData();
    } catch (error) {
      alert("Failed to moderate experience");
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/companies", newCompany);
      setShowCompanyModal(false);
      setNewCompany({ name: "", logo: "", description: "", website: "" });
      fetchData();
    } catch (error) {
      alert("Failed to create company");
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/job-roles", newRole);
      setShowRoleModal(false);
      setNewRole({ roleName: "", companyId: "" });
      fetchData();
    } catch (error) {
      alert("Failed to create role");
    }
  };

  const handleResolveReport = async (id, status) => {
    try {
      await api.patch(`/admin/reports/${id}/resolve`, { status });
      fetchData();
    } catch (error) {
      alert("Failed to resolve report");
    }
  };

  const handleUpdateSecurity = async () => {
    try {
      await api.post("/admin/security/policy");
      alert("Security policy updated successfully");
    } catch (error) {
      alert("Failed to update security policy");
    }
  };

  if (loading && !stats && activeTab === "overview") {
    return (
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold font-outfit mb-2 flex items-center gap-3">
              <Shield className="text-primary" size={32} />
              Admin Command Center
            </h1>
            <p className="text-muted-foreground">Manage the platform, moderate content, and view analytics.</p>
          </div>
          <div className="flex bg-background p-1.5 rounded-2xl shadow-sm border overflow-x-auto max-w-full">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchQuery(""); }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                  activeTab === tab.id 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {tab.icon}
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {activeTab === "overview" && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-12">
                {[
                  { label: "Total Users", value: stats?.users, icon: <Users />, color: "text-blue-600", bg: "bg-blue-100" },
                  { label: "Companies", value: stats?.companies, icon: <Building2 />, color: "text-emerald-600", bg: "bg-emerald-100" },
                  { label: "Experiences", value: stats?.experiences, icon: <Briefcase />, color: "text-amber-600", bg: "bg-amber-100" },
                  { label: "Total Comments", value: stats?.comments, icon: <MessageSquare />, color: "text-indigo-600", bg: "bg-indigo-100" },
                  { label: "Pending Reports", value: stats?.pendingReports, icon: <Flag />, color: "text-destructive", bg: "bg-destructive/10" },
                ].map((stat, i) => (
                  <Card key={i} className="border-none shadow-sm">
                    <CardContent className="p-6 text-center md:text-left">
                      <div className="flex items-center justify-between mb-4">
                        <div className={cn("p-2 rounded-lg mx-auto md:mx-0", stat.bg, stat.color)}>
                          {stat.icon}
                        </div>
                      </div>
                      <h3 className="text-3xl font-bold font-outfit">{stat.value || 0}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent System Activity</CardTitle>
                    <CardDescription>Real-time platform logs and actions.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-12 text-center bg-muted/30 rounded-2xl border border-dashed">
                      <Activity size={40} className="mx-auto text-muted-foreground opacity-20 mb-4" />
                      <p className="text-sm text-muted-foreground italic">System logs are currently empty.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-primary text-primary-foreground">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Security & Access</CardTitle>
                    <CardDescription className="text-white/70">Manage admin roles and system permissions.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-white/10 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield size={20} />
                        <div>
                          <p className="text-sm font-bold">Two-Factor Authentication</p>
                          <p className="text-[10px] opacity-70">Enforced for all admin accounts.</p>
                        </div>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                    </div>
                    <Button variant="secondary" className="w-full font-bold" onClick={handleUpdateSecurity}>Update Security Policy</Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeTab === "users" && (
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-7">
                <div>
                  <CardTitle className="text-xl">User Management</CardTitle>
                  <CardDescription>View and manage all registered users.</CardDescription>
                </div>
                <div className="relative w-full sm:w-64 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full h-9 pl-9 pr-4 rounded-lg border border-input bg-background focus:border-primary focus:ring-0 transition-all outline-none text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium border-y">
                      <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Experiences</th>
                        <th className="px-6 py-4">Joined</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                        <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold whitespace-nowrap">{u.name}</p>
                                <p className="text-[10px] text-muted-foreground">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <select 
                              className={cn(
                                "text-[10px] font-bold uppercase rounded-full px-2 py-1 border-none focus:ring-2 focus:ring-primary/20 bg-muted/50 transition-all cursor-pointer",
                                u.role === 'ADMIN' ? "text-purple-700 bg-purple-100" : "text-blue-700 bg-blue-100"
                              )}
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                            >
                              <option value="USER">USER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium">
                            {u._count?.experiences || 0} posts
                          </td>
                          <td className="px-6 py-4 text-muted-foreground text-xs">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "experiences" && (
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-7">
                <div>
                  <CardTitle className="text-xl">Content Moderation</CardTitle>
                  <CardDescription>Review and manage shared interview experiences.</CardDescription>
                </div>
                <div className="relative w-full sm:w-64 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                  <input
                    type="text"
                    placeholder="Search roles, companies..."
                    className="w-full h-9 pl-9 pr-4 rounded-lg border border-input bg-background focus:border-primary focus:ring-0 transition-all outline-none text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium border-y">
                      <tr>
                        <th className="px-6 py-4">Experience</th>
                        <th className="px-6 py-4">Author</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Reports</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {experiences.filter(exp => 
                        exp.jobRole.roleName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        exp.jobRole.company.name.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((exp) => (
                        <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-white border p-1.5 flex items-center justify-center shrink-0">
                                <img src={exp.jobRole.company.logo} alt="" className="max-h-full max-w-full object-contain" />
                              </div>
                              <div>
                                <p className="font-bold whitespace-nowrap">{exp.jobRole.roleName}</p>
                                <p className="text-[10px] text-muted-foreground">{exp.jobRole.company.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-medium whitespace-nowrap">{exp.user.name}</p>
                            <p className="text-[10px] text-muted-foreground">{exp.user.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                              exp.status === 'APPROVED' ? "bg-emerald-100 text-emerald-700" : 
                              exp.status === 'REMOVED' ? "bg-destructive/10 text-destructive" : 
                              "bg-amber-100 text-amber-700"
                            )}>
                              {exp.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {exp._count?.reports > 0 ? (
                              <span className="flex items-center gap-1 text-destructive font-bold text-xs">
                                <Flag size={12} /> {exp._count.reports} reports
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic font-medium">None</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {exp.status !== 'APPROVED' && (
                                <button 
                                  onClick={() => handleModerate(exp.id, 'APPROVED', "Your experience has been reviewed and approved.")}
                                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                  title="Approve"
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                              )}
                              <button 
                                onClick={() => setModerateExp({ id: exp.id, message: "" })}
                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                title="Warn User"
                              >
                                <AlertCircle size={16} />
                              </button>
                              <button 
                                onClick={() => handleModerate(exp.id, 'REMOVED', "Your experience has been removed for violating platform guidelines.")}
                                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                                title="Remove Content"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "companies" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <Card className="border-none shadow-sm overflow-hidden">
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-7">
                    <div>
                      <CardTitle className="text-xl">Companies & Job Roles</CardTitle>
                      <CardDescription>Manage the organization and role database.</CardDescription>
                    </div>
                    <Button size="sm" className="gap-2" onClick={() => setShowCompanyModal(true)}>
                      <Plus size={16} /> Add Company
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-y">
                          <tr>
                            <th className="px-6 py-4">Company</th>
                            <th className="px-6 py-4">Job Roles</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {companies.map((company) => (
                            <tr key={company.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-lg bg-white border p-1.5 flex items-center justify-center shrink-0">
                                    <img src={company.logo} alt="" className="max-h-full max-w-full object-contain" />
                                  </div>
                                  <div>
                                    <p className="font-bold whitespace-nowrap">{company.name}</p>
                                    <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{company.website}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1.5 min-w-[200px]">
                                  {company.jobRoles?.map((role) => (
                                    <span key={role.id} className="px-2 py-0.5 bg-muted text-[10px] font-medium rounded-full">
                                      {role.roleName}
                                    </span>
                                  ))}
                                  <button 
                                    onClick={() => {
                                      setNewRole({ ...newRole, companyId: company.id });
                                      setShowRoleModal(true);
                                    }}
                                    className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full hover:bg-primary/20 transition-all"
                                  >
                                    + Add Role
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Platform Data Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Highest Engagement Role</span>
                        <TrendingUp size={14} className="text-primary" />
                      </div>
                      <p className="text-lg font-bold font-outfit">Software Engineer</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Found in 12 companies</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl">Reported Content</CardTitle>
                <CardDescription>Review flags raised by the community.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium border-y">
                      <tr>
                        <th className="px-6 py-4">Reported Experience</th>
                        <th className="px-6 py-4">Reporter</th>
                        <th className="px-6 py-4">Reason</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {reports.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                            No reports to review. The community is clean!
                          </td>
                        </tr>
                      ) : reports.map((report) => (
                        <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-white border p-1 flex items-center justify-center shrink-0">
                                <img src={report.experience.jobRole.company.logo} alt="" className="max-h-full max-w-full object-contain" />
                              </div>
                              <div>
                                <p className="font-bold whitespace-nowrap">{report.experience.jobRole.roleName}</p>
                                <p className="text-[10px] text-muted-foreground whitespace-nowrap">Author: {report.experience.user.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium whitespace-nowrap">{report.reporter.name}</td>
                          <td className="px-6 py-4 text-xs max-w-xs">{report.reason}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                              report.status === 'RESOLVED' ? "bg-emerald-100 text-emerald-700" : 
                              report.status === 'DISMISSED' ? "bg-muted text-muted-foreground" : 
                              "bg-destructive/10 text-destructive"
                            )}>
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {report.status === 'PENDING' && (
                                <>
                                  <button 
                                    onClick={() => handleResolveReport(report.id, 'RESOLVED')}
                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                    title="Resolve"
                                  >
                                    <CheckCircle2 size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleResolveReport(report.id, 'DISMISSED')}
                                    className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-all"
                                    title="Dismiss"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCompanyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border"
            >
              <div className="px-8 py-6 border-b flex items-center justify-between bg-muted/20">
                <h3 className="text-xl font-bold font-outfit">Add New Company</h3>
                <button onClick={() => setShowCompanyModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleCreateCompany} className="p-8 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Company Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full h-11 px-4 rounded-xl border bg-muted/20 focus:bg-background transition-all outline-none focus:ring-2 focus:ring-primary/20"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Logo URL</label>
                  <input 
                    type="text" 
                    className="w-full h-11 px-4 rounded-xl border bg-muted/20 focus:bg-background transition-all outline-none focus:ring-2 focus:ring-primary/20"
                    value={newCompany.logo}
                    onChange={(e) => setNewCompany({ ...newCompany, logo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Website</label>
                  <input 
                    type="text" 
                    className="w-full h-11 px-4 rounded-xl border bg-muted/20 focus:bg-background transition-all outline-none focus:ring-2 focus:ring-primary/20"
                    value={newCompany.website}
                    onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Description</label>
                  <textarea 
                    className="w-full h-32 px-4 py-3 rounded-xl border bg-muted/20 focus:bg-background transition-all outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    value={newCompany.description}
                    onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                  />
                </div>
                <div className="pt-4">
                  <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold">Add Company</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showRoleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border"
            >
              <div className="px-8 py-6 border-b flex items-center justify-between bg-muted/20">
                <h3 className="text-xl font-bold font-outfit">Create Job Role</h3>
                <button onClick={() => setShowRoleModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleCreateRole} className="p-8 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Role Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Software Engineer"
                    className="w-full h-11 px-4 rounded-xl border bg-muted/20 focus:bg-background transition-all outline-none focus:ring-2 focus:ring-primary/20"
                    value={newRole.roleName}
                    onChange={(e) => setNewRole({ ...newRole, roleName: e.target.value })}
                  />
                </div>
                <div className="pt-4">
                  <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold">Create Role</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {moderateExp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border"
            >
              <div className="px-8 py-6 border-b flex items-center justify-between bg-muted/20">
                <h3 className="text-xl font-bold font-outfit">Moderate Content</h3>
                <button onClick={() => setModerateExp(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Send a warning message to the user regarding this experience.
                </p>
                <textarea 
                  className="w-full h-32 px-4 py-3 rounded-xl border bg-muted/20 focus:bg-background transition-all outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Type your message here..."
                  value={moderateExp.message}
                  onChange={(e) => setModerateExp({ ...moderateExp, message: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="h-12 font-bold"
                    onClick={() => handleModerate(moderateExp.id, 'APPROVED', moderateExp.message)}
                  >
                    Warn & Keep
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="h-12 font-bold"
                    onClick={() => handleModerate(moderateExp.id, 'REMOVED', moderateExp.message)}
                  >
                    Warn & Remove
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminDashboard;

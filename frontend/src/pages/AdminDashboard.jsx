import { useEffect, useState } from "react";
import { 
  Users, 
  Building2, 
  Briefcase, 
  MessageSquare, 
  Shield, 
  Search, 
  MoreVertical,
  ArrowUpRight,
  TrendingUp,
  Activity
} from "lucide-react";
import api from "../services/api";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "../components/UI/Card";
import Button from "../components/UI/Button";
import Skeleton from "../components/UI/Skeleton";
import { cn } from "../utils/cn";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/users")
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
      } catch (error) {
        console.error("Error fetching admin data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
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
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Activity size={18} /> View Logs
            </Button>
            <Button className="gap-2">
              <TrendingUp size={18} /> Reports
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Users", value: stats?.users, icon: <Users />, color: "text-blue-600", bg: "bg-blue-100" },
            { label: "Companies", value: stats?.companies, icon: <Building2 />, color: "text-emerald-600", bg: "bg-emerald-100" },
            { label: "Experiences", value: stats?.experiences, icon: <Briefcase />, color: "text-amber-600", bg: "bg-amber-100" },
            { label: "Total Comments", value: stats?.comments, icon: <MessageSquare />, color: "text-indigo-600", bg: "bg-indigo-100" },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-2 rounded-lg", stat.bg, stat.color)}>
                    {stat.icon}
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Lifetime</span>
                </div>
                <h3 className="text-3xl font-bold font-outfit">{stat.value}</h3>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Management Table */}
          <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
              <div>
                <CardTitle className="text-xl">User Management</CardTitle>
                <CardDescription>View and manage all registered users.</CardDescription>
              </div>
              <div className="relative w-64 group">
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
                      <th className="px-6 py-4">Joined</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold">{u.name}</p>
                              <p className="text-[10px] text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                            u.role === 'ADMIN' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                          )}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-muted-foreground hover:text-foreground">
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions / Recent Activity Placeholder */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2 h-11">
                  <Building2 size={18} /> Add New Company
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 h-11">
                  <Briefcase size={18} /> Create Job Role
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 h-11 text-destructive hover:bg-destructive/10">
                  <Shield size={18} /> Security Settings
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Pending Moderation</CardTitle>
                <CardDescription>Experiences waiting for review.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center bg-muted/30 rounded-xl border border-dashed">
                  <p className="text-xs text-muted-foreground italic">All caught up! No pending reviews.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

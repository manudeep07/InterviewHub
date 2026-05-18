import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { 
  TrendingUp, Users, Bookmark, PlusCircle, 
  ArrowRight, Star, Zap, Building, 
  MessageSquare, ThumbsUp, Calendar, LayoutDashboard
} from "lucide-react";
import api from "../services/api";
import AuthContext from "../context/AuthContext";
import { cn } from "../utils/cn";
import Button from "../components/UI/Button";
import Card, { CardContent } from "../components/UI/Card";
import Skeleton from "../components/UI/Skeleton";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/user/dashboard");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <Skeleton className="h-[600px] rounded-2xl" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-[400px] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Experiences Shared", value: data?.user?._count?.experiences || 0, icon: <LayoutDashboard size={20} />, color: "bg-blue-500" },
    { label: "Total Bookmarks", value: data?.user?._count?.bookmarks || 0, icon: <Bookmark size={20} />, color: "bg-purple-500" },
    { label: "Upvotes Received", value: data?.user?._count?.upvotes || 0, icon: <ThumbsUp size={20} />, color: "bg-amber-500" },
  ];

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Dashboard Header */}
      <div className="bg-background border-b pt-12 pb-12 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-outfit tracking-tight">
                Welcome back, <span className="text-primary">{user?.name?.split(' ')[0]}!</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's what's happening in your community today.
              </p>
            </div>
            <Link to="/companies">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                <PlusCircle size={20} />
                Share New Experience
              </motion.button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
            {stats.map((stat, idx) => (
              <Card key={idx} className="border-none bg-background shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-white", stat.color)}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-outfit">{stat.value}</p>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={20} className="text-primary fill-primary" />
              <h2 className="text-xl font-bold font-outfit">Trending For You</h2>
            </div>

            <div className="space-y-4">
              {data?.trendingExperiences.map((exp) => (
                <Link to={`/experience/${exp.id}`} key={exp.id} className="group block">
                  <Card className="hover:border-primary/40 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                          <div className="h-12 w-12 rounded-xl bg-white border flex items-center justify-center p-2 shadow-sm shrink-0">
                            <img src={exp.jobRole.company.logo} alt="" className="max-h-full max-w-full object-contain" />
                          </div>
                          <div>
                            <h3 className="font-bold group-hover:text-primary transition-colors leading-tight">
                              {exp.jobRole.roleName}
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium mt-1">
                              {exp.jobRole.company.name} • {exp.overallDifficulty} • {exp.result}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
                            <ThumbsUp size={14} className="text-primary" />
                            {exp._count.upvotes}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
                        <div className="flex gap-4">
                          <span className="flex items-center gap-1"><MessageSquare size={14} /> {exp._count.comments} Comments</span>
                          <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(exp.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="text-primary font-bold flex items-center gap-1">Read Story <ArrowRight size={14} /></span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={20} className="text-primary" />
                <h2 className="text-xl font-bold font-outfit">Recent Activity</h2>
              </div>
              <Card>
                <CardContent className="p-0">
                  {data?.recentActivity.map((activity, idx) => (
                    <div key={idx} className="p-4 border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] shrink-0">
                          {activity.user.name.charAt(0)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-xs">
                            <span className="font-bold">{activity.user.name}</span> shared an experience for <span className="font-bold">{activity.jobRole.roleName}</span> at <span className="text-primary">{activity.jobRole.company.name}</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground">{new Date(activity.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link to="/get-experiences/all" className="block p-3 text-center text-xs font-bold text-primary hover:bg-primary/5 transition-colors">
                    View Global Feed
                  </Link>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <h3 className="font-bold mb-2">Ready to contribute?</h3>
                <p className="text-sm opacity-80 mb-6">
                  Sharing your interview experience helps thousands of students and developers ace their dream jobs.
                </p>
                <Link to="/companies">
                  <Button variant="secondary" className="w-full font-bold">Share My Journey</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

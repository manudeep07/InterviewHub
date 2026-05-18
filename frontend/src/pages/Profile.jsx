import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  User, 
  Mail, 
  Calendar, 
  Briefcase, 
  ThumbsUp, 
  MessageSquare, 
  ArrowRight, 
  Settings, 
  Bookmark,
  Award,
  BarChart3,
  Globe
} from "lucide-react";
import api from "../services/api";
import AuthContext from "../context/AuthContext";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "../components/UI/Card";
import Button from "../components/UI/Button";
import Skeleton from "../components/UI/Skeleton";
import { cn } from "../utils/cn";

function ProfilePage() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("experiences");

  const isOwnProfile = !id || Number(id) === user?.id;

  useEffect(() => {
    fetchProfileData();
  }, [id, user]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const targetId = id || user?.id;
      if (!targetId) return;

      const profileUrl = isOwnProfile ? "/user/profile" : `/user/profile/${targetId}`;
      const experiencesUrl = isOwnProfile ? "/user/experiences" : `/user/experiences/${targetId}`;

      const [profileRes, expRes] = await Promise.all([
        api.get(profileUrl),
        api.get(experiencesUrl)
      ]);

      setProfileData(profileRes.data);
      setExperiences(expRes.data);

      if (isOwnProfile) {
        const bookmarksRes = await api.get("/engagement/bookmarks");
        setBookmarks(bookmarksRes.data);
      }
    } catch (error) {
      console.error("Error fetching profile data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatRequest = async () => {
    try {
      await api.post("/chat/request", { receiverId: Number(id) });
      alert("Chat request sent!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-8">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">User not found</h2>
        <Link to="/"><Button>Back Home</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Profile Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="overflow-hidden border-none shadow-xl">
              <div className="h-32 bg-gradient-to-r from-primary to-primary-foreground/20" />
              <CardContent className="p-6 -mt-16 text-center">
                <div className="h-32 w-32 rounded-3xl bg-background border-8 border-background mx-auto shadow-2xl flex items-center justify-center font-bold text-5xl text-primary overflow-hidden relative group">
                  {profileData.name.charAt(0)}
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <User className="text-primary" size={32} />
                  </div>
                </div>
                
                <div className="mt-6">
                  <h2 className="text-3xl font-bold font-outfit text-foreground">{profileData.name}</h2>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                      {profileData.role}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Award size={10} /> Reputation: {profileData.totalUpvotes || profileData._count?.upvotes || 0}
                    </span>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-2 py-6 border-y border-muted-foreground/10">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{profileData._count?.experiences || 0}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Shared</p>
                  </div>
                  <div className="text-center border-x border-muted-foreground/10">
                    <p className="text-2xl font-bold text-foreground">{profileData.totalUpvotes || profileData._count?.upvotes || 0}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Upvotes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{profileData._count?.bookmarks || 0}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Bookmarks</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  {isOwnProfile ? (
                    <Button variant="outline" className="w-full gap-2 py-6 rounded-2xl border-primary/20 hover:bg-primary/5">
                      <Settings size={18} /> Edit Profile
                    </Button>
                  ) : (
                    <Button onClick={handleChatRequest} className="w-full gap-2 py-6 rounded-2xl shadow-lg shadow-primary/20">
                      <MessageSquare size={18} /> Start Conversation
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe size={18} className="text-primary" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-muted/50">
                  <span className="text-muted-foreground flex items-center gap-2"><Calendar size={14} /> Joined</span>
                  <span className="font-bold">{new Date(profileData.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                </div>
                {isOwnProfile && (
                  <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-muted/50">
                    <span className="text-muted-foreground flex items-center gap-2"><Mail size={14} /> Email</span>
                    <span className="font-medium text-xs">{profileData.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Content */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between bg-background p-2 rounded-2xl shadow-sm border">
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTab("experiences")}
                  className={cn(
                    "px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                    activeTab === "experiences" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted text-muted-foreground"
                  )}
                >
                  <Briefcase size={18} />
                  Experiences
                </button>
                {isOwnProfile && (
                  <button 
                    onClick={() => setActiveTab("bookmarks")}
                    className={cn(
                      "px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                      activeTab === "bookmarks" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <Bookmark size={18} />
                    Bookmarks
                  </button>
                )}
              </div>
              {isOwnProfile && (
                <Link to="/companies" className="hidden sm:block mr-2">
                  <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                    Share New
                  </Button>
                </Link>
              )}
            </div>

            <div className="space-y-6">
              {activeTab === "experiences" && (
                experiences.length === 0 ? (
                  <Card className="p-20 text-center flex flex-col items-center justify-center border-dashed bg-transparent border-2">
                    <div className="h-20 w-20 bg-muted rounded-3xl flex items-center justify-center mb-6 text-muted-foreground rotate-3">
                      <Briefcase size={40} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No experiences shared yet</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                      {isOwnProfile 
                        ? "Start contributing to the community by sharing your interview journey." 
                        : "This user hasn't shared any public experiences yet."}
                    </p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {experiences.map((exp) => (
                      <Link key={exp.id} to={`/experience/${exp.id}`} className="block group">
                        <Card className="hover:border-primary/50 hover:shadow-xl transition-all duration-300 overflow-hidden border-none shadow-sm">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-5">
                                <div className="h-16 w-16 rounded-2xl bg-white border flex items-center justify-center p-3 shadow-sm group-hover:scale-110 transition-transform">
                                  <img src={exp.jobRole.company.logo} alt="" className="max-h-full max-w-full object-contain" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{exp.jobRole.roleName}</h3>
                                    {exp.isAnonymous && (
                                      <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase font-bold tracking-widest">Anonymous</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground font-medium">{exp.jobRole.company.name} • <span className={cn(exp.result === 'Selected' ? "text-emerald-600" : "text-red-600")}>{exp.result}</span></p>
                                </div>
                              </div>
                              <div className="flex items-center gap-6 text-muted-foreground">
                                <div className="hidden md:flex flex-col items-end">
                                  <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                                    <ThumbsUp size={14} className="text-primary" />
                                    {exp._count.upvotes}
                                  </div>
                                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Upvotes</p>
                                </div>
                                <div className="hidden md:flex flex-col items-end border-l pl-6">
                                  <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                                    <MessageSquare size={14} className="text-primary" />
                                    {exp._count.comments}
                                  </div>
                                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Comments</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                  <ArrowRight size={20} />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )
              )}

              {activeTab === "bookmarks" && (
                bookmarks.length === 0 ? (
                  <Card className="p-20 text-center flex flex-col items-center justify-center border-dashed bg-transparent border-2">
                    <div className="h-20 w-20 bg-muted rounded-3xl flex items-center justify-center mb-6 text-muted-foreground -rotate-3">
                      <Bookmark size={40} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No bookmarks yet</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                      Save interesting interview experiences to read them later.
                    </p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {bookmarks.map((bookmark) => (
                      <Link key={bookmark.bookmarkId || bookmark.id} to={`/experience/${bookmark.id}`} className="block group">
                        <Card className="hover:border-primary/50 hover:shadow-xl transition-all duration-300 overflow-hidden border-none shadow-sm">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-5">
                                <div className="h-16 w-16 rounded-2xl bg-white border flex items-center justify-center p-3 shadow-sm group-hover:scale-110 transition-transform">
                                  <img src={bookmark.jobRole.company.logo} alt="" className="max-h-full max-w-full object-contain" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{bookmark.jobRole.roleName}</h3>
                                  <p className="text-sm text-muted-foreground font-medium">{bookmark.jobRole.company.name} • {bookmark.result}</p>
                                </div>
                              </div>
                              <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                <ArrowRight size={20} />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

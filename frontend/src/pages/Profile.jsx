import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Calendar, Briefcase, ThumbsUp, MessageSquare, ArrowRight, Settings, ExternalLink } from "lucide-react";
import api from "../services/api";
import AuthContext from "../context/AuthContext";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "../components/UI/Card";
import Button from "../components/UI/Button";
import Skeleton from "../components/UI/Skeleton";
import { cn } from "../utils/cn";

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [myExperiences, setMyExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileRes, expRes] = await Promise.all([
          api.get("/user/profile"),
          api.get("/user/my-experiences")
        ]);
        setProfileData(profileRes.data);
        setMyExperiences(expRes.data);
      } catch (error) {
        console.error("Error fetching profile data", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-8">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Profile Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="overflow-hidden">
              <div className="h-24 bg-primary" />
              <CardContent className="p-6 -mt-12 text-center">
                <div className="h-24 w-24 rounded-full bg-background border-4 border-background mx-auto shadow-lg flex items-center justify-center font-bold text-3xl text-primary overflow-hidden">
                  {profileData?.name.charAt(0)}
                </div>
                <h2 className="mt-4 text-2xl font-bold font-outfit">{profileData?.name}</h2>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                  <Mail size={14} /> {profileData?.email}
                </p>
                
                <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-xl font-bold">{profileData?._count.experiences}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Experiences</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{profileData?._count.upvotes}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Upvotes</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-2">
                  <Button variant="outline" className="w-full gap-2">
                    <Settings size={16} /> Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><Calendar size={14} /> Joined</span>
                  <span className="font-medium">{new Date(profileData?.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><Briefcase size={14} /> Role</span>
                  <span className="font-medium">{profileData?.role}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Content */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-outfit">My Contributions</h2>
              <Link to="/companies">
                <Button variant="primary" size="sm">Share New Experience</Button>
              </Link>
            </div>

            {myExperiences.length === 0 ? (
              <Card className="p-20 text-center flex flex-col items-center justify-center border-dashed">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-6 text-muted-foreground">
                  <Briefcase size={32} />
                </div>
                <h3 className="text-lg font-bold mb-2">No experiences shared yet</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Start contributing to the community by sharing your interview journey.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {myExperiences.map((exp) => (
                  <Link key={exp.id} to={`/experience/${exp.id}`} className="block group">
                    <Card className="hover:border-primary/50 transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-white border flex items-center justify-center p-2 shadow-sm">
                              <img src={exp.jobRole.company.logo} alt="" className="max-h-full max-w-full object-contain" />
                            </div>
                            <div>
                              <h3 className="font-bold group-hover:text-primary transition-colors">{exp.jobRole.roleName}</h3>
                              <p className="text-xs text-muted-foreground">{exp.jobRole.company.name} • {exp.result}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="flex items-center gap-1.5 text-xs">
                              <ThumbsUp size={14} />
                              {exp._count.upvotes}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <MessageSquare size={14} />
                              {exp._count.comments}
                            </div>
                            <ArrowRight size={18} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

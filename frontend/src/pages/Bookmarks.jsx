import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Briefcase, User, Calendar, ArrowRight, Search } from "lucide-react";
import api from "../services/api";
import AuthContext from "../context/AuthContext";
import Card, { CardContent } from "../components/UI/Card";
import Button from "../components/UI/Button";
import Skeleton from "../components/UI/Skeleton";
import { cn } from "../utils/cn";

function BookmarksPage() {
  const { user } = useContext(AuthContext);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchBookmarks = async () => {
    try {
      const response = await api.get("/engagement/bookmarks");
      setBookmarks(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mb-10">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12">
          <h1 className="text-4xl font-bold font-outfit mb-2">Saved Experiences</h1>
          <p className="text-muted-foreground">Your curated list of helpful interview journeys.</p>
        </div>

        {bookmarks.length === 0 ? (
          <Card className="p-20 text-center flex flex-col items-center justify-center border-dashed">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6 text-muted-foreground">
              <Bookmark size={40} />
            </div>
            <h3 className="text-xl font-bold mb-2">No bookmarks yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
              Explore interview experiences and save the ones you find most helpful for quick access later.
            </p>
            <Link to="/get-experiences/all">
              <Button>Explore Experiences</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookmarks.map((exp) => (
              <Link to={`/experience/${exp.id}`} key={exp.id} className="group">
                <Card className="h-full hover:border-primary/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white border flex items-center justify-center p-1.5 shadow-sm">
                          <img src={exp.jobRole.company.logo} alt="" className="max-h-full max-w-full object-contain" />
                        </div>
                        <div>
                          <h4 className="font-bold leading-tight group-hover:text-primary transition-colors line-clamp-1">{exp.jobRole.roleName}</h4>
                          <p className="text-xs text-muted-foreground font-medium">{exp.jobRole.company.name}</p>
                        </div>
                      </div>
                      <Bookmark className="text-primary fill-current" size={18} />
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User size={14} />
                        <span>Shared by {exp.user.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Briefcase size={14} />
                        <span>{exp.rounds?.length || 0} Interview Rounds</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold border",
                        exp.overallDifficulty === 'Hard' ? "bg-red-50 text-red-700 border-red-100" : 
                        exp.overallDifficulty === 'Medium' ? "bg-amber-50 text-amber-700 border-amber-100" : 
                        "bg-emerald-50 text-emerald-700 border-emerald-100"
                      )}>
                        {exp.overallDifficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary text-secondary-foreground border">
                        {exp.result}
                      </span>
                    </div>

                    <div className="flex items-center justify-end pt-4 border-t border-muted/50">
                      <div className="text-xs font-bold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Read Experience <ArrowRight size={14} />
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
  );
}

export default BookmarksPage;

import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Search, Filter, Briefcase, Calendar, MessageSquare, ThumbsUp, ArrowRight, Building } from "lucide-react";
import api from "../services/api";
import { cn } from "../utils/cn";
import Card, { CardContent } from "../components/UI/Card";
import Button from "../components/UI/Button";
import Skeleton from "../components/UI/Skeleton";

function AllExperiences() {
  const { id } = useParams(); // 'all' or specific roleId
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [difficultyFilter, setDifficultyFilter] = useState(searchParams.get("difficulty") || "");
  const [resultFilter, setResultFilter] = useState(searchParams.get("result") || "");
  const searchQuery = searchParams.get("q") || "";

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      let response;
      const params = new URLSearchParams();
      if (difficultyFilter) params.append("difficulty", difficultyFilter);
      if (resultFilter) params.append("result", resultFilter);
      
      if (searchQuery) {
        params.append("q", searchQuery);
        response = await api.get(`/experiences/search?${params.toString()}`);
      } else if (id === "all") {
        response = await api.get(`/experiences/all?${params.toString()}`);
      } else {
        response = await api.get(`/experiences/role/${id}?${params.toString()}`);
      }
      
      setExperiences(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (difficultyFilter) params.append("difficulty", difficultyFilter);
    if (resultFilter) params.append("result", resultFilter);
    if (searchQuery) params.append("q", searchQuery);
    setSearchParams(params);

    fetchExperiences();
  }, [id, difficultyFilter, resultFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold font-outfit mb-4">
                {searchQuery ? `Search results for "${searchQuery}"` : 
                 id === "all" ? "Explore Experiences" : "Role Experiences"}
              </h1>
              <p className="text-muted-foreground">
                Learn from the community. Real questions, real feedback, real success stories.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-background border rounded-lg shadow-sm">
                <Filter size={16} className="text-muted-foreground" />
                <select
                  value={resultFilter}
                  onChange={(e) => setResultFilter(e.target.value)}
                  className="bg-transparent text-sm font-medium focus:outline-none"
                >
                  <option value="">All Results</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Waitlisted">Waitlisted</option>
                </select>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-background border rounded-lg shadow-sm">
                <Briefcase size={16} className="text-muted-foreground" />
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="bg-transparent text-sm font-medium focus:outline-none"
                >
                  <option value="">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Experience Feed */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : experiences.length === 0 ? (
          <Card className="p-20 text-center flex flex-col items-center justify-center border-dashed">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6 text-muted-foreground">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-bold mb-2">No experiences found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
              We couldn't find any experiences matching your current filters. Try adjusting them or explore other roles.
            </p>
            <Button onClick={() => { setDifficultyFilter(""); setResultFilter(""); }} variant="outline">
              Clear All Filters
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {experiences.map((exp) => (
              <Link to={`/experience/${exp.id}`} key={exp.id} className="group">
                <Card className="h-full border-muted/50 hover:border-primary/50 transition-all duration-300">
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
                      <div className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                        exp.result === 'Selected' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                        exp.result === 'Rejected' ? "bg-red-50 text-red-600 border border-red-100" : 
                        "bg-amber-50 text-amber-600 border border-amber-100"
                      )}>
                        {exp.result}
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar size={14} />
                        <span>{new Date(exp.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
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
                      {exp.rounds[0]?.topics?.slice(0, 2).map((topic, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary text-secondary-foreground border border-border">
                          {topic}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <ThumbsUp size={14} className="text-primary" />
                          {exp._count?.upvotes || 0}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <MessageSquare size={14} className="text-primary" />
                          {exp._count?.comments || 0}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Read More <ArrowRight size={14} />
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

export default AllExperiences;
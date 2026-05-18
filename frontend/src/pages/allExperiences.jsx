import { useEffect, useState, useCallback } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { 
  Search, Filter, Briefcase, Calendar, MessageSquare, 
  ThumbsUp, ArrowRight, Building, SortDesc, X, 
  ChevronDown, SlidersHorizontal, Trophy, Target, EyeOff
} from "lucide-react";
import api from "../services/api";
import { cn } from "../utils/cn";
import Card, { CardContent } from "../components/UI/Card";
import Button from "../components/UI/Button";
import Skeleton from "../components/UI/Skeleton";
import { motion, AnimatePresence } from "framer-motion";

function AllExperiences() {
  const { id } = useParams(); // 'all' or specific roleId
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [experiences, setExperiences] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const [difficultyFilter, setDifficultyFilter] = useState(searchParams.get("difficulty") || "");
  const [resultFilter, setResultFilter] = useState(searchParams.get("result") || "");
  const [companyFilter, setCompanyFilter] = useState(searchParams.get("companyId") || "");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");

  const fetchCompanies = async () => {
    try {
      const res = await api.get("/companies");
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExperiences = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (difficultyFilter) params.append("difficulty", difficultyFilter);
      if (resultFilter) params.append("result", resultFilter);
      if (companyFilter) params.append("companyId", companyFilter);
      if (searchQuery) params.append("search", searchQuery);
      if (sortBy) params.append("sort", sortBy);
      if (id !== "all") params.append("roleId", id);
      
      const response = await api.get(`/experiences/all?${params.toString()}`);
      setExperiences(response.data);
      
      // Update URL
      setSearchParams(params);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id, difficultyFilter, resultFilter, companyFilter, searchQuery, sortBy, setSearchParams]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchExperiences();
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [fetchExperiences]);

  const clearFilters = () => {
    setDifficultyFilter("");
    setResultFilter("");
    setCompanyFilter("");
    setSearchQuery("");
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Hero Header */}
      <div className="bg-background border-b pt-12 pb-12 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <nav className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                <span>/</span>
                <span className="text-foreground">Experiences</span>
              </nav>
              <h1 className="text-4xl md:text-5xl font-bold font-outfit tracking-tight">
                Community <span className="text-primary text-glow">Intelligence</span>
              </h1>
              <p className="text-muted-foreground mt-2 max-w-lg">
                Browse real interview insights from thousands of candidates. master the patterns and ace your next interview.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Search role, company, or topic..."
                  className="w-full h-12 pl-11 pr-4 bg-muted/50 border-2 border-transparent rounded-xl focus:bg-background focus:border-primary focus:ring-0 transition-all outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                className="md:hidden h-12 w-12 p-0"
                onClick={() => setIsFilterOpen(true)}
              >
                <SlidersHorizontal size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-8 sticky top-24 h-fit">
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                  <Filter size={16} className="text-primary" /> Filters
                </h3>
                <button 
                  onClick={clearFilters}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Clear All
                </button>
              </div>

              {/* Sorting */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-muted-foreground px-2">Sort By</label>
                <div className="relative group">
                  <SortDesc size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-background border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all appearance-none outline-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="most_upvotes">Most Helpful</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Company Filter */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-muted-foreground px-2">Company</label>
                <div className="relative">
                  <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <select
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-background border rounded-xl text-sm font-medium appearance-none outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">All Companies</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Difficulty Filter */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-muted-foreground px-2">Difficulty</label>
                <div className="grid grid-cols-1 gap-2">
                  {['Easy', 'Medium', 'Hard'].map(level => (
                    <button
                      key={level}
                      onClick={() => setDifficultyFilter(difficultyFilter === level ? "" : level)}
                      className={cn(
                        "h-10 px-4 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between group",
                        difficultyFilter === level 
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                          : "bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      )}
                    >
                      {level}
                      <Target size={14} className={cn("opacity-0 transition-opacity", difficultyFilter === level ? "opacity-100" : "group-hover:opacity-30")} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Result Filter */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-muted-foreground px-2">Result</label>
                <div className="grid grid-cols-1 gap-2">
                  {['Selected', 'Rejected', 'Waitlisted'].map(res => (
                    <button
                      key={res}
                      onClick={() => setResultFilter(resultFilter === res ? "" : res)}
                      className={cn(
                        "h-10 px-4 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between group",
                        resultFilter === res 
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                          : "bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      )}
                    >
                      {res}
                      <Trophy size={14} className={cn("opacity-0 transition-opacity", resultFilter === res ? "opacity-100" : "group-hover:opacity-30")} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Experience Feed */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-medium text-muted-foreground">
                Showing <span className="text-foreground font-bold">{experiences.length}</span> experiences
              </p>
              <div className="hidden lg:flex items-center gap-2">
                {/* Active Filter Tags */}
                {difficultyFilter && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase border border-primary/20">
                    {difficultyFilter} <X size={10} className="cursor-pointer" onClick={() => setDifficultyFilter("")} />
                  </span>
                )}
                {resultFilter && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase border border-primary/20">
                    {resultFilter} <X size={10} className="cursor-pointer" onClick={() => setResultFilter("")} />
                  </span>
                )}
              </div>
            </div>

            {loading ? (
              <div className="grid gap-6">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-2xl" />
                ))}
              </div>
            ) : experiences.length === 0 ? (
              <Card className="p-20 text-center flex flex-col items-center justify-center border-dashed bg-muted/20">
                <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6 text-muted-foreground shadow-inner">
                  <Search size={40} />
                </div>
                <h3 className="text-xl font-bold mb-2">No matches found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Button onClick={clearFilters} variant="outline" className="rounded-xl px-8 h-12 font-bold">
                  Reset All Filters
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <Link to={`/experience/${exp.id}`} key={exp.id} className="group block">
                    <Card className="border-muted/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden relative">
                      <div className={cn(
                        "absolute top-0 left-0 w-1 h-full",
                        exp.result === 'Selected' ? "bg-emerald-500" : 
                        exp.result === 'Rejected' ? "bg-red-500" : "bg-amber-500"
                      )} />
                      
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-muted/30 border flex items-center justify-center p-2.5 shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                              <img src={exp.jobRole.company.logo} alt="" className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-bold text-lg group-hover:text-primary transition-colors leading-tight">
                                {exp.jobRole.roleName}
                              </h4>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-medium">
                                <span className="flex items-center gap-1.5"><Building size={14} /> {exp.jobRole.company.name}</span>
                                <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(exp.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                {exp.isAnonymous && (
                                  <span className="flex items-center gap-1.5 text-primary/70 italic bg-primary/5 px-1.5 py-0.5 rounded">
                                    <EyeOff size={12} /> Anonymous
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn(
                              "px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider",
                              exp.overallDifficulty === 'Hard' ? "bg-red-50 text-red-700 border-red-100" : 
                              exp.overallDifficulty === 'Medium' ? "bg-amber-50 text-amber-700 border-amber-100" : 
                              "bg-emerald-50 text-emerald-700 border-emerald-100"
                            )}>
                              {exp.overallDifficulty}
                            </span>
                            <span className={cn(
                              "px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider",
                              exp.result === 'Selected' ? "bg-emerald-500 text-white border-emerald-500" : 
                              exp.result === 'Rejected' ? "bg-muted text-muted-foreground border-border" : 
                              "bg-amber-500 text-white border-amber-500"
                            )}>
                              {exp.result}
                            </span>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50 text-muted-foreground text-[10px] font-bold border">
                            <Briefcase size={12} /> {exp.rounds?.length || 0} ROUNDS
                          </span>
                          {exp.rounds[0]?.topics?.slice(0, 3).map((topic, idx) => (
                            <span key={idx} className="px-2 py-1 rounded-lg text-[10px] font-bold bg-primary/5 text-primary border border-primary/10">
                              {topic}
                            </span>
                          ))}
                        </div>

                        <div className="mt-6 pt-6 border-t flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                              <ThumbsUp size={16} className="text-primary" />
                              {exp._count?.upvotes || 0}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                              <MessageSquare size={16} className="text-primary" />
                              {exp._count?.comments || 0}
                            </div>
                          </div>
                          <div className="text-xs font-black text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase tracking-tighter">
                            View Story <ArrowRight size={14} strokeWidth={3} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-background border-l z-[101] shadow-2xl overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold font-outfit">Filters</h3>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 rounded-full hover:bg-muted">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8 pb-10">
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sorting</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'newest', label: 'Newest First' },
                      { id: 'oldest', label: 'Oldest First' },
                      { id: 'most_upvotes', label: 'Most Helpful' }
                    ].map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSortBy(s.id)}
                        className={cn(
                          "h-12 px-4 rounded-xl text-sm font-bold border transition-all text-left",
                          sortBy === s.id ? "bg-primary text-primary-foreground" : "bg-muted/30"
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Difficulty</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Easy', 'Medium', 'Hard'].map(level => (
                      <button
                        key={level}
                        onClick={() => setDifficultyFilter(difficultyFilter === level ? "" : level)}
                        className={cn(
                          "h-12 rounded-xl text-xs font-bold border transition-all",
                          difficultyFilter === level ? "bg-primary text-primary-foreground" : "bg-muted/30"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Result</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Selected', 'Rejected', 'Waitlisted'].map(res => (
                      <button
                        key={res}
                        onClick={() => setResultFilter(resultFilter === res ? "" : res)}
                        className={cn(
                          "h-12 px-4 rounded-xl text-sm font-bold border transition-all text-left",
                          resultFilter === res ? "bg-primary text-primary-foreground" : "bg-muted/30"
                        )}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-background pt-4 border-t grid grid-cols-2 gap-4 mt-auto">
                <Button variant="outline" onClick={clearFilters} className="rounded-xl h-12 font-bold">Reset</Button>
                <Button onClick={() => setIsFilterOpen(false)} className="rounded-xl h-12 font-bold shadow-lg shadow-primary/20">Apply</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AllExperiences;
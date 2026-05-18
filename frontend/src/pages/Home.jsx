import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, TrendingUp, Building2, Users, ArrowRight, Star, ShieldCheck, Zap } from "lucide-react";
import api from "../services/api";
import { cn } from "../utils/cn";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import Card, { CardContent } from "../components/UI/Card";
import Skeleton from "../components/UI/Skeleton";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [recentExperiences, setRecentExperiences] = useState([]);
  const [featuredCompanies, setFeaturedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 1) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await api.get(`/companies?search=${searchQuery}`);
        setSuggestions(response.data);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Error fetching suggestions", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expRes, compRes] = await Promise.all([
          api.get("/experiences/all"),
          api.get("/companies")
        ]);
        setRecentExperiences(expRes.data.slice(0, 3));
        setFeaturedCompanies(compRes.data.slice(0, 6));
      } catch (error) {
        console.error("Error fetching home data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/get-experiences/all?q=${searchQuery}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (company) => {
    setSearchQuery(company.name);
    setShowSuggestions(false);
    navigate(`/companies/${company.id}`);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0) {
        e.preventDefault();
        handleSuggestionClick(suggestions[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-6">
              The Future of Interview Prep
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 font-outfit">
              Ace your next <span className="text-primary">tech interview</span> <br /> with community intelligence.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Access real interview experiences from top tech companies. Learn the patterns, master the questions, and join the elite.
            </p>

            <div className="max-w-2xl mx-auto relative group">
              <form onSubmit={handleSearch} className="relative flex items-center z-50">
                <Search className="absolute left-4 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Search by company, role, or topic (e.g. Google SDE, Dynamic Programming)"
                  className="w-full h-16 pl-12 pr-32 rounded-2xl border-2 border-muted bg-background text-lg focus:border-primary focus:ring-0 transition-all outline-none shadow-sm group-hover:shadow-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                <Button type="submit" className="absolute right-2 h-12 px-8 rounded-xl">
                  Explore
                </Button>
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-2xl shadow-xl z-40 overflow-hidden"
                >
                  <div className="p-2">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground px-3 py-2">Companies</p>
                    {suggestions.map((company, index) => (
                      <div
                        key={company.id}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors",
                          selectedIndex === index ? "bg-primary/10 text-primary" : "hover:bg-muted"
                        )}
                        onClick={() => handleSuggestionClick(company)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <img src={company.logo} alt="" className="h-6 w-6 object-contain grayscale opacity-70" />
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-sm">{company.name}</span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Company</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-muted/50 p-3 text-center border-t">
                    <p className="text-xs text-muted-foreground">
                      Press <kbd className="px-1 py-0.5 rounded border bg-background text-[10px]">Enter</kbd> to select
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary" />
                Verified Experiences
              </div>
              <div className="flex items-center gap-2">
                <Users size={18} className="text-primary" />
                10k+ Community Members
              </div>
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-primary" />
                Real-time Updates
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        </div>
      </section>

      {/* Featured Companies */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold font-outfit mb-2">Featured Companies</h2>
            <p className="text-muted-foreground text-sm">Targeting a specific giant? Start here.</p>
          </div>
          <Link to="/companies">
            <Button variant="ghost" className="gap-2">
              View all <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {loading ? (
            Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
          ) : (
            featuredCompanies.map((company) => (
              <Link key={company.id} to={`/companies/${company.id}`}>
                <Card className="h-32 flex flex-col items-center justify-center p-4 hover:border-primary/50 group">
                  <img src={company.logo} alt={company.name} className="h-12 mb-3 grayscale group-hover:grayscale-0 transition-all opacity-70 group-hover:opacity-100" />
                  <span className="text-sm font-semibold">{company.name}</span>
                </Card>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Trending Experiences */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg text-primary-foreground">
                <TrendingUp size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-bold font-outfit mb-1">Trending Experiences</h2>
                <p className="text-muted-foreground text-sm">Most helpful recently shared interview insights.</p>
              </div>
            </div>
            <Link to="/get-experiences/all">
              <Button variant="outline" className="gap-2">
                Browse Feed <ArrowRight size={16} />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)
            ) : (
              recentExperiences.map((exp) => (
                <Link key={exp.id} to={`/experience/${exp.id}`}>
                  <Card className="h-full group">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <img src={exp.jobRole.company.logo} alt="" className="h-8 w-8 rounded bg-white p-1 border shadow-sm" />
                        <div>
                          <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{exp.jobRole.roleName}</h4>
                          <p className="text-xs text-muted-foreground">{exp.jobRole.company.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mb-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          exp.overallDifficulty === 'Hard' ? "bg-red-100 text-red-700" : 
                          exp.overallDifficulty === 'Medium' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                        )}>
                          {exp.overallDifficulty}
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          exp.result === 'Selected' ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                        )}>
                          {exp.result}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-3 mb-6 italic">
                        "{exp.rounds[0]?.questions[0] || "Sharing my experience with the interview process..."}"
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><Star size={14} className="text-amber-500 fill-amber-500" /> {exp._count.upvotes}</span>
                          <span className="flex items-center gap-1 font-medium">{exp._count.comments} comments</span>
                        </div>
                        <span>{new Date(exp.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <Card className="bg-primary text-primary-foreground overflow-hidden relative border-none">
          <div className="p-12 md:p-20 relative z-10 text-center md:text-left md:flex items-center justify-between">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-bold font-outfit mb-6">Contribute to the community.</h2>
              <p className="text-primary-foreground/80 text-lg mb-8">
                Your interview experience could be the key to someone's dream job. Share your story today and help others succeed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/companies">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto gap-2">
                    Post My Experience <ArrowRight size={18} />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <Building2 size={200} className="text-white/10" />
              </div>
            </div>
          </div>
          {/* Decorative background pattern */}
          <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
            <div className="grid grid-cols-12 h-full">
              {Array(48).fill(0).map((_, i) => (
                <div key={i} className="border-r border-b border-white" />
              ))}
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default HomePage;
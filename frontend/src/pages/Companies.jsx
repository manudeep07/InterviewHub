import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Search, ExternalLink, ArrowRight, Briefcase } from "lucide-react";
import api from "../services/api";
import Card, { CardContent } from "../components/UI/Card";
import Button from "../components/UI/Button";
import Skeleton from "../components/UI/Skeleton";

function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get("/companies");
      setCompanies(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold font-outfit mb-4">Top Tech Companies</h1>
            <p className="text-muted-foreground">Explore interview patterns and roles at the world's leading technology organizations.</p>
          </div>
          
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              placeholder="Filter companies..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background focus:border-primary focus:ring-0 transition-all outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="p-20 text-center bg-background border border-dashed rounded-2xl">
            <p className="text-muted-foreground">No companies found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredCompanies.map((company) => (
              <Link key={company.id} to={`/companies/${company.id}`} className="group">
                <Card className="h-full hover:border-primary/50 transition-all duration-300 overflow-hidden">
                  <div className="h-24 bg-muted/50 flex items-center justify-center p-6 border-b">
                    <img 
                      src={company.logo || `https://ui-avatars.com/api/?name=${company.name}&background=random`} 
                      alt={company.name} 
                      className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100" 
                    />
                  </div>
                  <CardContent className="p-5">
                    <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{company.name}</h2>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
                      {company.description || "Leading technology company with innovative products and culture."}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                        View Roles <ArrowRight size={14} />
                      </div>
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                        <Building2 size={16} className="text-muted-foreground" />
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

export default CompaniesPage;
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Briefcase, Building2, Globe, ArrowLeft, ArrowRight, Plus } from "lucide-react";
import api from "../services/api";
import Card, { CardContent, CardHeader, CardTitle } from "../components/UI/Card";
import Button from "../components/UI/Button";
import Skeleton from "../components/UI/Skeleton";

function CompanyDetailsPage() {
  const { id } = useParams();
  const [roles, setRoles] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, companyRes] = await Promise.all([
          api.get(`/roles/company/${id}`),
          api.get(`/companies/${id}`) // Assuming this endpoint exists based on current routes
        ]);
        setRoles(rolesRes.data);
        setCompany(companyRes.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-8">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <Link to="/companies" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Companies
        </Link>

        {/* Company Header */}
        <Card className="mb-12 border-none shadow-md overflow-hidden">
          <div className="h-2 bg-primary w-full" />
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="h-24 w-24 rounded-2xl bg-white border flex items-center justify-center p-4 shadow-sm shrink-0">
                <img src={company?.logo} alt="" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-4xl font-bold font-outfit mb-2">{company?.name}</h1>
                  <p className="text-muted-foreground max-w-3xl">{company?.description || "Explore various roles and interview experiences shared by the community."}</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  {company?.website && (
                    <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                      <Globe size={16} /> Official Website <ExternalLink size={14} className="ml-1" />
                    </a>
                  )}
                  <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <Briefcase size={16} /> {roles.length} Roles Listed
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-outfit">Available Roles</h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {roles.map((role) => (
              <Card key={role.id} className="hover:border-primary/50 transition-all group">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-secondary-foreground">
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold group-hover:text-primary transition-colors">{role.roleName}</h3>
                        <p className="text-xs text-muted-foreground font-medium">Click to see interview experiences</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/create-experience/${role.id}`}>
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full cursor-pointer" title="Contribute Experience">
                          <Plus size={18} />
                        </Button>
                      </Link>
                      <Link to={`/get-experiences/${role.id}`}>
                        <Button variant="outline" size="sm" className="gap-2 group-hover:bg-primary cursor-pointer group-hover:text-primary-foreground group-hover:border-primary transition-all">
                          View <ArrowRight size={14} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Other Role Option */}
            <Card className="hover:border-primary/50 border-dashed transition-all group bg-muted/5">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Plus size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold group-hover:text-primary transition-colors">Other Role</h3>
                      <p className="text-xs text-muted-foreground font-medium">Can't find your role? Add it here.</p>
                    </div>
                  </div>
                  <Link to={`/create-experience/new?companyId=${id}`}>
                    <Button variant="outline" size="sm" className="gap-2 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                      Contribute <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility icon for external link
const ExternalLink = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export default CompanyDetailsPage;
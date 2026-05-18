import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  HelpCircle,
  FileText,
  Layout as LayoutIcon,
  Send,
  Building2
} from "lucide-react";
import api from "../services/api";
import Button from "../components/UI/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "../components/UI/Card";
import Input from "../components/UI/Input";
import { cn } from "../utils/cn";

function CreateExperiencePage() {
  const { roleId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const companyId = searchParams.get("companyId");

  const [roleInfo, setRoleInfo] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [customRoleName, setCustomRoleName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [result, setResult] = useState("");
  const [overallDifficulty, setOverallDifficulty] = useState("");
  const [rounds, setRounds] = useState([
    {
      roundType: "Technical",
      customRoundType: "",
      title: "",
      difficulty: "Medium",
      questions: "",
      topics: "",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (roleId === "new" && companyId) {
          const res = await api.get(`/companies/${companyId}`);
          setCompanyInfo(res.data);
        } else if (roleId) {
          const response = await api.get(`/roles/${roleId}`);
          setRoleInfo(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch info:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [roleId, companyId]);

  const handleAddRound = () => {
    setRounds([
      ...rounds,
      {
        roundType: "Technical",
        customRoundType: "",
        title: "",
        difficulty: "Medium",
        questions: "",
        topics: "",
      },
    ]);
  };

  const handleRemoveRound = (index) => {
    setRounds(rounds.filter((_, i) => i !== index));
  };

  const handleRoundChange = (index, field, value) => {
    const updatedRounds = [...rounds];
    updatedRounds[index][field] = value;
    setRounds(updatedRounds);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!result || !overallDifficulty) return alert("Please fill all overview fields");
    if (roleId === "new" && !customRoleName) return alert("Please enter the job role name");
    
    setIsSubmitting(true);

    try {
      const processedRounds = rounds.map(({ customRoundType, ...rest }) => ({
        ...rest,
        roundType: rest.roundType === "Other" ? customRoundType : rest.roundType,
        questions: rest.questions
          ? String(rest.questions).split(",").map((q) => q.trim()).filter(Boolean)
          : [],
        topics: rest.topics
          ? String(rest.topics).split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      }));

      const payload = {
        overallDifficulty,
        result,
        jobRoleId: roleId === "new" ? "new" : roleId,
        customRoleName: roleId === "new" ? customRoleName : undefined,
        companyId: roleId === "new" ? companyId : undefined,
        isAnonymous,
        rounds: processedRounds,
      };

      const res = await api.post("/experiences", payload);
      const targetId = roleId === "new" ? res.data.jobRoleId : roleId;
      navigate(`/get-experiences/${targetId}`);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to create experience");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold">Loading...</div>;

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to={roleId === 'new' ? `/companies/${companyId}` : `/companies/${roleInfo?.companyId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors font-medium">
          <ArrowLeft size={16} /> Back to Roles
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-bold font-outfit mb-3">Share Your Journey</h1>
          {(roleInfo || companyInfo) && (
            <div className="flex items-center gap-2 text-primary font-bold mb-3">
              <Building2 size={18} />
              <span>{roleInfo?.company.name || companyInfo?.name}</span>
              {roleInfo && (
                <>
                  <ChevronRight size={16} className="text-muted-foreground" />
                  <span>{roleInfo.roleName}</span>
                </>
              )}
            </div>
          )}
          <p className="text-muted-foreground">Your insights can help thousands of candidates land their dream jobs. Be as detailed as possible.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Step 0: Custom Role Name if needed */}
          {roleId === "new" && (
            <section className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">0</div>
                <h2 className="text-xl font-bold font-outfit">Job Role</h2>
              </div>
              <Card className="border-none shadow-md overflow-hidden">
                <CardContent className="p-8">
                  <Input
                    label="What role did you interview for?"
                    placeholder="e.g. Software Development Engineer, Product Manager"
                    value={customRoleName}
                    onChange={(e) => setCustomRoleName(e.target.value)}
                    required
                  />
                </CardContent>
              </Card>
            </section>
          )}

          {/* Step 1: Overview */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">{roleId === 'new' ? '1' : '1'}</div>
              <h2 className="text-xl font-bold font-outfit">General Overview</h2>
            </div>
            <Card className="border-none shadow-md overflow-hidden">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Final Outcome</label>
                    <select
                      value={result}
                      onChange={(e) => setResult(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-input bg-background focus:border-primary focus:ring-0 transition-all outline-none text-sm font-medium"
                      required
                    >
                      <option value="">Select Result</option>
                      <option value="Selected">Selected</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Waitlisted">Waitlisted</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Interview Difficulty</label>
                    <select
                      value={overallDifficulty}
                      onChange={(e) => setOverallDifficulty(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-input bg-background focus:border-primary focus:ring-0 transition-all outline-none text-sm font-medium"
                      required
                    >
                      <option value="">Select Difficulty</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Anonymous Toggle */}
                <div className="mt-8 pt-8 border-t">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-dashed border-muted-foreground/20">
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm">Post Anonymously</h4>
                      <p className="text-xs text-muted-foreground">Your identity will be hidden from everyone except yourself.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Step 2: Rounds */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">{roleId === 'new' ? '2' : '2'}</div>
                <h2 className="text-xl font-bold font-outfit">Detailed Rounds</h2>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleAddRound} className="gap-2">
                <Plus size={16} /> Add Round
              </Button>
            </div>

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {rounds.map((round, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border-none shadow-md overflow-hidden relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center">
                            {index + 1}
                          </span>
                          <CardTitle className="text-lg">Round Details</CardTitle>
                        </div>
                        {rounds.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRound(index)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </CardHeader>
                      <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold">Round Type</label>
                            <select
                              value={round.roundType}
                              onChange={(e) => handleRoundChange(index, "roundType", e.target.value)}
                              className="w-full h-11 px-4 rounded-xl border border-input bg-background focus:border-primary focus:ring-0 transition-all outline-none text-sm"
                            >
                              <option value="Online Assessment">Online Assessment</option>
                              <option value="Technical">Technical</option>
                              <option value="Behavioral">Behavioral</option>
                              <option value="Managerial">Managerial</option>
                              <option value="HR">HR</option>
                              <option value="GD">Group Discussion</option>
                              <option value="Assignment">Assignment</option>
                              <option value="Other">Other</option>
                            </select>
                            {round.roundType === "Other" && (
                              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
                                <Input
                                  placeholder="Enter custom round type..."
                                  value={round.customRoundType}
                                  onChange={(e) => handleRoundChange(index, "customRoundType", e.target.value)}
                                  required
                                />
                              </motion.div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold">Round Difficulty</label>
                            <select
                              value={round.difficulty}
                              onChange={(e) => handleRoundChange(index, "difficulty", e.target.value)}
                              className="w-full h-11 px-4 rounded-xl border border-input bg-background focus:border-primary focus:ring-0 transition-all outline-none text-sm"
                            >
                              <option value="Easy">Easy</option>
                              <option value="Medium">Medium</option>
                              <option value="Hard">Hard</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <Input
                              label="Round Title (Optional)"
                              placeholder="e.g. System Design, DSA Round 1"
                              value={round.title}
                              onChange={(e) => handleRoundChange(index, "title", e.target.value)}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Input
                              label="Topics Covered"
                              placeholder="e.g. Dynamic Programming, React, System Design (comma separated)"
                              value={round.topics}
                              onChange={(e) => handleRoundChange(index, "topics", e.target.value)}
                            />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-semibold">Questions Asked</label>
                            <textarea
                              className="w-full min-h-[100px] p-4 rounded-xl border border-input bg-background focus:border-primary focus:ring-0 transition-all outline-none text-sm resize-none"
                              placeholder="Describe the questions asked in this round (comma separated)..."
                              value={round.questions}
                              onChange={(e) => handleRoundChange(index, "questions", e.target.value)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          <div className="pt-8 flex flex-col items-center">
            <Button 
              type="submit" 
              className="w-full md:w-80 h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 gap-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting Journey..." : <>Submit Experience <Send size={20} /></>}
            </Button>
            <p className="mt-4 text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" /> All your data is encrypted and secure.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateExperiencePage;
import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ThumbsUp, 
  Bookmark, 
  MessageSquare, 
  Calendar, 
  User as UserIcon, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Share2,
  ChevronDown,
  ChevronUp,
  Send,
  Flag,
  X
} from "lucide-react";
import api from "../services/api";
import AuthContext from "../context/AuthContext";
import { cn } from "../utils/cn";
import Button from "../components/UI/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "../components/UI/Card";
import Input from "../components/UI/Input";
import Skeleton from "../components/UI/Skeleton";
import CommentThread from "../components/Discussion/CommentThread";

function ExperienceDetailsPage() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Engagement states
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);

  // Comment states
  const [commentContent, setCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    fetchExperience();
  }, [id, user]); // Refetch if user changes to check engagement

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const fetchExperience = async () => {
    try {
      const response = await api.get(`/experiences/${id}`);
      const data = response.data;
      setExperience(data);
      setUpvoteCount(data._count?.upvotes || 0);

      // Check engagement
      if (user) {
        setIsUpvoted(data.upvotes.some(u => u.userId === user.id));
        setIsBookmarked(data.bookmarks.some(b => b.userId === user.id));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUpvote = async () => {
    if (!user) return alert("Please login to upvote");
    try {
      const res = await api.post(`/engagement/experiences/${id}/upvote`);
      if (res.data.upvoted) {
        setIsUpvoted(true);
        setUpvoteCount(prev => prev + 1);
      } else {
        setIsUpvoted(false);
        setUpvoteCount(prev => prev - 1);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleBookmark = async () => {
    if (!user) return alert("Please login to bookmark");
    try {
      const res = await api.post(`/engagement/experiences/${id}/bookmark`);
      setIsBookmarked(res.data.bookmarked);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentAction = async (content, parentId = null) => {
    if (!user) return alert("Please login to participate in the discussion");
    
    try {
      const res = await api.post(`/engagement/experiences/${id}/comments`, {
        content,
        parentId
      });
      
      setExperience(prev => ({
        ...prev,
        comments: [...(prev.comments || []), res.data],
        _count: {
          ...prev._count,
          comments: (prev._count?.comments || 0) + 1
        }
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleReport = async () => {
    if (!user) return alert("Please login to report content");
    if (!reportReason.trim()) return alert("Please provide a reason");
    
    try {
      await api.post("/reports", { experienceId: id, reason: reportReason });
      alert("Thank you for your report. Our moderators will review it shortly.");
      setShowReportModal(false);
      setReportReason("");
    } catch (error) {
      alert("Failed to submit report. Please try again.");
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

  if (!experience) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Experience not found</h2>
        <Link to="/get-experiences/all"><Button>Back to Feed</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Header Card */}
            <Card className="border-none shadow-md overflow-hidden">
              <div className="h-2 bg-primary w-full" />
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-white border flex items-center justify-center p-3 shadow-sm">
                      <img src={experience.jobRole.company.logo} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold font-outfit mb-1">{experience.jobRole.roleName}</h1>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                        <span>{experience.jobRole.company.name}</span>
                        <span>•</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          experience.result === 'Selected' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        )}>
                          {experience.result}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant={isUpvoted ? "primary" : "outline"} 
                      onClick={handleToggleUpvote}
                      className="gap-2"
                    >
                      <ThumbsUp size={18} className={isUpvoted ? "fill-current" : ""} />
                      {upvoteCount}
                    </Button>
                    <Button 
                      variant={isBookmarked ? "primary" : "outline"} 
                      onClick={handleToggleBookmark}
                      className="px-3"
                    >
                      <Bookmark size={18} className={isBookmarked ? "fill-current" : ""} />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/50 border border-muted-foreground/10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Difficulty</p>
                    <p className="font-semibold text-sm">{experience.overallDifficulty}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rounds</p>
                    <p className="font-semibold text-sm">{experience.rounds.length} Total</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Date</p>
                    <p className="font-semibold text-sm">{new Date(experience.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Discussion</p>
                    <p className="font-semibold text-sm">{experience._count?.comments || 0} Comments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rounds Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-outfit px-2">Interview Journey</h2>
              <div className="space-y-4">
                {experience.rounds.map((round, index) => (
                  <motion.div
                    key={round.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden group">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-48 bg-muted/30 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-muted/50">
                          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mb-2">
                            {index + 1}
                          </div>
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Round</span>
                        </div>
                        <div className="flex-1 p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{round.roundType}</h3>
                              {round.title && <p className="text-sm text-muted-foreground">Round Title: {round.title}</p>}
                            </div>
                            <span className="text-[10px] font-bold px-2 py-1 bg-secondary rounded border">{round.difficulty || 'Medium'}</span>
                          </div>
                          
                          {round.topics && round.topics.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm text-muted-foreground mb-2">Topics Covered:</p>
                              <div className="flex flex-wrap gap-2">
                                {round.topics.map((topic, i) => (
                                  <span key={i} className="text-xs font-bold px-2 py-1 bg-primary/5 text-primary border border-primary/10 rounded">
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground mb-2">Questions:</p>
                          <div className="space-y-3">
                            {round.questions.map((q, i) => (
                              <div key={i} className="flex gap-3 text-sm text-foreground/80 bg-muted/20 p-3 rounded-lg border border-transparent hover:border-muted-foreground/10 transition-colors">
                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span>{q}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <CommentThread 
              comments={experience.comments || []}
              onAddComment={handleCommentAction}
              experienceOwnerId={experience.userId}
              currentUser={user}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About the Author</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    {experience.isAnonymous && experience.userId !== user?.id ? "?" : experience.user.name.charAt(0)}
                  </div>
                  <div>
                    {experience.isAnonymous && experience.userId !== user?.id ? (
                      <p className="font-bold text-muted-foreground">Anonymous User</p>
                    ) : (
                      <Link to={`/profile/${experience.userId}`} className="font-bold hover:text-primary transition-colors block">
                        {experience.user.name}
                        {experience.isAnonymous && experience.userId === user?.id && (
                          <span className="ml-2 text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase">You</span>
                        )}
                      </Link>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {experience.isAnonymous && experience.userId !== user?.id ? "Hidden Identity" : "Active Contributor"}
                    </p>
                  </div>
                </div>
                
                {user && user.id !== experience.userId && (
                  <Button 
                    className="w-full gap-2" 
                    variant="outline"
                    onClick={async () => {
                      try {
                        await api.post("/chat/request", { receiverId: experience.userId });
                        alert("Chat request sent!");
                      } catch (err) {
                        alert(err.response?.data?.message || "Failed to send request");
                      }
                    }}
                  >
                    <MessageSquare size={16} />
                    Request Chat
                  </Button>
                )}

                {(!experience.isAnonymous || experience.userId === user?.id) && (
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Experiences Shared</span>
                      <span className="font-bold">{experience.user._count?.experiences || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Total Upvotes</span>
                      <span className="font-bold text-emerald-600">{experience.user._count?.upvotes || 0}</span>
                    </div>
                  </div>
                )}

                {user && user.id !== experience.userId && (
                  <div className="pt-6 mt-4 border-t">
                    <button 
                      onClick={() => setShowReportModal(true)}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive transition-colors group"
                    >
                      <Flag size={14} className="group-hover:fill-destructive/10" />
                      Report this experience
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips for this Role</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-4">
                <p>• Focus on core DSA concepts for this level.</p>
                <p>• Prepare well for {experience.jobRole.company.name}'s specific culture rounds.</p>
                <p>• Review the "Star" method for behavioral questions.</p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border"
            >
              <div className="px-8 py-6 border-b flex items-center justify-between bg-muted/20">
                <h3 className="text-xl font-bold font-outfit">Report Experience</h3>
                <button onClick={() => setShowReportModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Help us understand what's wrong with this experience. Your report is anonymous.
                </p>
                <textarea 
                  className="w-full h-32 px-4 py-3 rounded-xl border bg-muted/20 focus:bg-background transition-all outline-none focus:ring-2 focus:ring-primary/20 resize-none text-sm"
                  placeholder="Reason for reporting (e.g. misleading content, spam, inappropriate language)..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12 font-bold"
                    onClick={() => setShowReportModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1 h-12 font-bold"
                    onClick={handleReport}
                  >
                    Submit Report
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ExperienceDetailsPage;
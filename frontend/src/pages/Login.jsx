import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import AuthContext from "../context/AuthContext";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import Card, { CardContent } from "../components/UI/Card";

function LoginPage() {
  const { login } = useContext(AuthContext);

  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(userData);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl">I</div>
            <span className="text-2xl font-bold font-outfit tracking-tight">InterviewHub</span>
          </Link>
          <h1 className="text-3xl font-bold font-outfit tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
        </div>

        <Card className="border-none shadow-xl">
          <CardContent className="p-8">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2"
              >
                <Lock size={14} />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    required
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background focus:border-primary focus:ring-0 transition-all outline-none text-sm"
                    value={userData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold">Password</label>
                  <Link to="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background focus:border-primary focus:ring-0 transition-all outline-none text-sm"
                    value={userData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl text-md font-bold gap-2 mt-2" disabled={loading}>
                {loading ? "Signing in..." : <>Sign In <ArrowRight size={18} /></>}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Create an account</Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1"><ShieldCheck size={14} /> Secure Authentication</span>
          <span className="w-1 h-1 bg-muted-foreground rounded-full" />
          <span>Privacy Policy</span>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;
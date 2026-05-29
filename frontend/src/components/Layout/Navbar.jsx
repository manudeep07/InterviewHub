import { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Search, Menu, X, User, LogOut, Bookmark, 
  PlusCircle, Briefcase, Building, Shield, 
  ChevronDown, Bell, Settings, MessageSquare
} from "lucide-react";
import AuthContext from "../../context/AuthContext";
import NotificationDropdown from "../Notifications/NotificationDropdown";
import { cn } from "../../utils/cn";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { name: "Companies", href: "/companies", icon: <Building size={18} /> },
    { name: "Experiences", href: "/get-experiences/all", icon: <Briefcase size={18} /> },
  ];

  const authLinks = [
    { name: "Profile", href: "/profile", icon: <User size={16} /> },
    ...(user?.role !== "ADMIN" ? [
      { name: "Bookmarks", href: "/bookmarks", icon: <Bookmark size={16} /> },
      { name: "Messages", href: "/messages", icon: <MessageSquare size={16} /> },
    ] : [
      { name: "Admin Dashboard", href: "/admin", icon: <Shield size={16} /> }
    ]),
  ];

  const UserAvatar = ({ name }) => (
    <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
      {name?.charAt(0).toUpperCase()}
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                I
              </div>
              <span className="text-xl font-bold tracking-tight font-outfit">InterviewHub</span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-colors rounded-lg flex items-center gap-2",
                    isActive(link.href) 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {link.name}
                  {isActive(link.href) && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                      initial={false}
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-3">
                {user.role !== "ADMIN" && (
                  <Link to="/companies">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                    >
                      <PlusCircle size={16} />
                      Share Experience
                    </motion.button>
                  </Link>
                )}

                {user.role !== "ADMIN" && <div className="h-6 w-px bg-border mx-1" />}
                
                {user.role !== "ADMIN" && (
                  <Link to="/messages" className={cn(
                    "p-2 rounded-xl hover:bg-muted transition-all text-muted-foreground relative",
                    isActive("/messages") && "text-primary bg-primary/10"
                  )}>
                    <MessageSquare size={20} />
                  </Link>
                )}

                <NotificationDropdown />

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={cn(
                      "flex items-center gap-2 p-1.5 rounded-xl hover:bg-muted transition-all border border-transparent",
                      isProfileOpen && "bg-muted border-border"
                    )}
                  >
                    <UserAvatar name={user.name} />
                    <div className="flex flex-col items-start mr-1">
                      <span className="text-[11px] font-bold leading-none">{user.name.split(' ')[0]}</span>
                      <span className="text-[9px] text-muted-foreground">{user.role.toLowerCase()}</span>
                    </div>
                    <ChevronDown size={14} className={cn("text-muted-foreground transition-transform", isProfileOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 bg-background border rounded-2xl shadow-2xl overflow-hidden py-1 z-50"
                      >
                        <div className="px-4 py-3 border-b bg-muted/20">
                          <p className="text-xs font-bold truncate">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                        </div>

                        <div className="p-1">
                          {authLinks.map((link) => (
                            <Link
                              key={link.name}
                              to={link.href}
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                            >
                              <span className="text-muted-foreground">{link.icon}</span>
                              {link.name}
                            </Link>
                          ))}
                        </div>

                        <div className="p-1 border-t">
                          <button
                            onClick={() => {
                              logout();
                              setIsProfileOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <LogOut size={16} />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Login
                </Link>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            {user && <NotificationDropdown />}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-background overflow-hidden"
          >
            <div className="p-4 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground px-4 mb-2">Navigation</p>
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
                      isActive(link.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                ))}
              </div>

              {user ? (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground px-4 mb-2">Account</p>
                  {authLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
                        isActive(link.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  ))}
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 px-2">
                  <Link 
                    to="/login" 
                    onClick={() => setIsOpen(false)} 
                    className="flex items-center justify-center h-12 rounded-xl border border-border font-bold text-sm"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsOpen(false)} 
                    className="flex items-center justify-center h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

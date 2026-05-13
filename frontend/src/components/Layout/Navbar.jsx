import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, User, LogOut, Bookmark, PlusCircle, Briefcase, Building, Shield } from "lucide-react";
import AuthContext from "../../context/AuthContext";
import NotificationDropdown from "../Notifications/NotificationDropdown";
import { cn } from "../../utils/cn";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: "Companies", href: "/companies", icon: <Building size={18} /> },
    { name: "Experiences", href: "/get-experiences/all", icon: <Briefcase size={18} /> },
  ];

  const authLinks = user ? [
    ...(user.role === "ADMIN" ? [{ name: "Admin", href: "/admin", icon: <Shield size={18} /> }] : []),
    { name: "Create Post", href: "/companies", icon: <PlusCircle size={18} />, primary: true },
    { name: "Bookmarks", href: "/bookmarks", icon: <Bookmark size={18} /> },
    { name: "Profile", href: "/profile", icon: <User size={18} /> },
  ] : [];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                I
              </div>
              <span className="text-xl font-bold tracking-tight font-outfit">InterviewHub</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="h-8 w-px bg-border mx-2" />
                <NotificationDropdown />
                <div className="h-8 w-px bg-border mx-2" />
                {authLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors flex items-center gap-2",
                      link.primary 
                        ? "bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                ))}
                <div className="h-8 w-px bg-border mx-2" />
                <button
                  onClick={logout}
                  className="text-sm font-medium text-muted-foreground hover:text-destructive transition-colors flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Login
                </Link>
                <Link to="/register" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-muted-foreground">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t bg-background px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setIsOpen(false)}
              className="block text-lg font-medium text-muted-foreground"
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px bg-border" />
          {user ? (
            <>
              {authLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-medium text-muted-foreground"
                >
                  {link.name}
                </Link>
              ))}
              <button
                onClick={() => { logout(); setIsOpen(false); }}
                className="block text-lg font-medium text-destructive"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-lg font-medium text-muted-foreground">
                Login
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="text-lg font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg text-center">
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

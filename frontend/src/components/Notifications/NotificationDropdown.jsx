import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, ExternalLink, Clock, User as UserIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import api from "../../services/api";
import { cn } from "../../utils/cn";
import { motion, AnimatePresence } from "framer-motion";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case "COMMENT": return "bg-blue-100 text-blue-600";
      case "REPLY": return "bg-purple-100 text-purple-600";
      case "UPVOTE": return "bg-orange-100 text-orange-600";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-muted transition-colors"
      >
        <Bell size={20} className={cn("text-muted-foreground", unreadCount > 0 && "text-primary")} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 md:w-96 bg-background border rounded-2xl shadow-2xl overflow-hidden z-[100]"
          >
            <div className="p-4 border-b flex items-center justify-between bg-muted/20">
              <h3 className="font-bold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <CheckCheck size={14} /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div 
                    key={n.id}
                    className={cn(
                      "p-4 border-b last:border-0 hover:bg-muted/50 transition-colors relative flex gap-3",
                      !n.isRead && "bg-primary/5"
                    )}
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0",
                      getTypeStyles(n.type)
                    )}>
                      {n.sender?.name?.charAt(0).toUpperCase() || "S"}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm leading-tight", !n.isRead ? "font-bold text-foreground" : "text-muted-foreground")}>
                          {n.content}
                        </p>
                        {!n.isRead && (
                          <button 
                            onClick={() => markAsRead(n.id)}
                            className="p-1 rounded-full hover:bg-primary/10 text-primary shrink-0"
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                        {n.experienceId && (
                          <Link 
                            to={`/experience/${n.experienceId}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <ExternalLink size={10} />
                            View Experience
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-muted-foreground">
                  <Bell className="mx-auto mb-2 opacity-20" size={32} />
                  <p className="text-sm font-medium">All caught up!</p>
                </div>
              )}
            </div>
            
            <div className="p-3 text-center border-t bg-muted/10">
              <button className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;

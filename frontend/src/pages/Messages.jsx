import { useState, useEffect, useContext, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Send, 
  User as UserIcon, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  ShieldAlert,
  ChevronLeft,
  Search,
  Clock
} from "lucide-react";
import AuthContext from "../context/AuthContext";
import api from "../services/api";
import { cn } from "../utils/cn";
import Button from "../components/UI/Button";
import Card, { CardContent } from "../components/UI/Card";
import Skeleton from "../components/UI/Skeleton";

function MessagesPage() {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchConversations();
    
    // Polling for new conversations/requests
    const convInterval = setInterval(fetchConversations, 10000); // Every 10s
    return () => clearInterval(convInterval);
  }, []);

  useEffect(() => {
    let msgInterval;
    if (activeChat) {
      fetchMessages(activeChat.id);
      setIsMobileListOpen(false);
      
      // Polling for new messages in active chat
      msgInterval = setInterval(() => fetchMessages(activeChat.id), 3000); // Every 3s
    }
    return () => clearInterval(msgInterval);
  }, [activeChat]);

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await api.get("/chat/my-chats");
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const res = await api.get(`/chat/messages/${chatId}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const res = await api.post("/chat/send", {
        conversationId: activeChat.id,
        content: newMessage
      });
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (chatId, action) => {
    try {
      await api.post("/chat/handle-request", { chatId, action });
      fetchConversations();
      if (activeChat?.id === chatId) {
        setActiveChat(prev => ({ ...prev, status: action }));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const handleBlock = async (chatId) => {
    if (!confirm("Are you sure you want to block this user?")) return;
    try {
      await api.post("/chat/block", { chatId });
      fetchConversations();
      setActiveChat(null);
    } catch (err) {
      alert("Blocking failed");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex gap-6 h-[80vh]">
        <Skeleton className="w-80 h-full rounded-2xl" />
        <Skeleton className="flex-1 h-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-120px)]">
      <div className="flex gap-6 h-full bg-background border rounded-3xl overflow-hidden shadow-xl">
        
        {/* Sidebar - Conversation List */}
        <div className={cn(
          "w-full lg:w-80 shrink-0 border-r flex flex-col bg-muted/10 transition-all",
          !isMobileListOpen && "hidden lg:flex"
        )}>
          <div className="p-6 border-b bg-background">
            <h2 className="text-xl font-bold font-outfit mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                placeholder="Search conversations..." 
                className="w-full h-10 pl-10 pr-4 bg-muted/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare className="mx-auto text-muted-foreground/20 mb-4" size={48} />
                <p className="text-sm text-muted-foreground font-medium">No messages yet</p>
              </div>
            ) : (
              conversations.map(chat => {
                const otherUser = chat.senderId === user.id ? chat.receiver : chat.sender;
                const lastMessage = chat.messages?.[0];
                const isActive = activeChat?.id === chat.id;

                return (
                  <button
                    key={chat.id}
                    onClick={() => setActiveChat(chat)}
                    className={cn(
                      "w-full p-4 rounded-2xl flex items-center gap-4 transition-all hover:bg-muted/50 text-left relative",
                      isActive && "bg-white shadow-sm border border-primary/10"
                    )}
                  >
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                      {otherUser.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm truncate">{otherUser.name}</span>
                        {chat.status === "PENDING" && chat.receiverId === user.id && (
                          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {chat.status === "PENDING" ? "Requested an invitation" : (lastMessage?.content || "Start chatting...")}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={cn(
          "flex-1 flex flex-col bg-background relative",
          isMobileListOpen && "hidden lg:flex"
        )}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsMobileListOpen(true)}
                    className="lg:hidden p-2 -ml-2 rounded-full hover:bg-muted"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {(activeChat.senderId === user.id ? activeChat.receiver : activeChat.sender).name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{(activeChat.senderId === user.id ? activeChat.receiver : activeChat.sender).name}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        activeChat.status === "ACCEPTED" ? "bg-emerald-500" : "bg-amber-500"
                      )} />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{activeChat.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={() => handleBlock(activeChat.id)}>
                    <ShieldAlert size={18} className="text-red-500" />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/5">
                {activeChat.status === "PENDING" && activeChat.receiverId === user.id ? (
                  <Card className="max-w-md mx-auto border-dashed bg-primary/5 border-primary/20 mt-10">
                    <CardContent className="p-8 text-center space-y-6">
                      <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                        <MessageSquare size={32} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold font-outfit mb-2">Chat Invitation</h4>
                        <p className="text-sm text-muted-foreground">
                          {activeChat.sender.name} would like to discuss your interview experience professionally.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button className="flex-1 gap-2" onClick={() => handleAction(activeChat.id, "ACCEPTED")}>
                          <CheckCircle2 size={16} /> Accept
                        </Button>
                        <Button className="flex-1 gap-2" variant="outline" onClick={() => handleAction(activeChat.id, "REJECTED")}>
                          <XCircle size={16} /> Decline
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : activeChat.status === "PENDING" ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <div className="h-16 w-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                      <Clock size={32} />
                    </div>
                    <div>
                      <h4 className="font-bold">Waiting for Acceptance</h4>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        The recipient must accept your invitation before you can start messaging.
                      </p>
                    </div>
                  </div>
                ) : activeChat.status === "REJECTED" ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <XCircle size={48} className="mb-4 opacity-20" />
                    <p>This request was declined.</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => {
                      const isMe = msg.senderId === user.id;
                      return (
                        <div key={msg.id} className={cn(
                          "flex flex-col",
                          isMe ? "items-end" : "items-start"
                        )}>
                          <div className={cn(
                            "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                            isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-white border rounded-tl-none"
                          )}>
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-1 px-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              {activeChat.status === "ACCEPTED" && (
                <div className="p-4 border-t bg-background">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a professional message..."
                      className="flex-1 h-12 px-6 rounded-2xl bg-muted/50 border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
                    />
                    <Button type="submit" disabled={!newMessage.trim()} className="h-12 w-12 rounded-2xl p-0">
                      <Send size={20} />
                    </Button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
              <div className="h-24 w-24 bg-primary/5 text-primary rounded-3xl flex items-center justify-center animate-bounce-slow">
                <MessageSquare size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-outfit">Your Conversations</h3>
                <p className="text-muted-foreground max-w-md">
                  Select a chat from the sidebar or request a new invitation from an experience page.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;

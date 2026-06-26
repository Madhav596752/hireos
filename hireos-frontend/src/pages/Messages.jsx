// src/pages/Messages.jsx — API-connected
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Paperclip, Smile, Search, Loader2, Plus } from "lucide-react";
import { messagesApi } from "@/api/messages";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Messages() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [team, setTeam] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeUser, setActiveUser] = useState(null);
    const [draft, setDraft] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);

    // Load conversations + team on mount
    useEffect(() => {
        Promise.all([messagesApi.getConversations(), messagesApi.getTeam()])
            .then(([convs, members]) => {
                setConversations(convs);
                setTeam(members);
                // Auto-open first conversation if any
                const first = convs[0]?.participant || members[0];
                if (first) openConversation(first);
            })
            .catch(() => toast.error("Could not load messages"))
            .finally(() => setLoading(false));
    }, []); // eslint-disable-line

    const openConversation = async (participant) => {
        setActiveUser(participant);
        try {
            const msgs = await messagesApi.getMessages(participant.id);
            setMessages(msgs);
            // Mark as read locally
            setConversations((prev) =>
                prev.map((c) =>
                    c.participant.id === participant.id ? { ...c, unread: 0 } : c
                )
            );
        } catch {
            toast.error("Could not load messages");
        }
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!draft.trim() || !activeUser || sending) return;
        setSending(true);
        const text = draft.trim();
        setDraft("");
        try {
            const msg = await messagesApi.sendMessage(activeUser.id, text);
            setMessages((prev) => [...prev, msg]);
            // Update conversation preview
            setConversations((prev) => {
                const exists = prev.find((c) => c.participant.id === activeUser.id);
                if (exists) {
                    return prev.map((c) =>
                        c.participant.id === activeUser.id
                            ? { ...c, lastMessage: text, lastMessageAt: new Date() }
                            : c
                    );
                }
                return [{ participant: activeUser, lastMessage: text, lastMessageAt: new Date(), unread: 0 }, ...prev];
            });
        } catch {
            toast.error("Message failed to send");
            setDraft(text);
        } finally {
            setSending(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    // Build display list: conversations first, then team members not yet in convs
    const convParticipantIds = new Set(conversations.map((c) => c.participant.id));
    const allContacts = [
        ...conversations.map((c) => ({ ...c.participant, preview: c.lastMessage, unread: c.unread })),
        ...team.filter((m) => !convParticipantIds.has(m.id)).map((m) => ({ ...m, preview: null, unread: 0 })),
    ].filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));

    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div
            className="grid grid-cols-1 md:grid-cols-[320px_1fr] border border-border rounded-lg overflow-hidden h-[calc(100vh-9rem)] bg-card"
            data-testid="messages-page"
        >
            {/* Left: contact list */}
            <div className="border-r border-border flex flex-col">
                <div className="p-4 border-b border-border">
                    <h2 className="font-display text-lg font-semibold mb-3">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search…"
                            className="pl-9 h-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : allContacts.length === 0 ? (
                        <div className="text-center py-10 text-sm text-muted-foreground">No team members yet.</div>
                    ) : (
                        allContacts.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => openConversation(c)}
                                data-testid={`conversation-${c.id}`}
                                className={cn(
                                    "w-full text-left px-4 py-3 border-b border-border hover:bg-secondary/30 flex items-center gap-3 transition-colors",
                                    activeUser?.id === c.id && "bg-secondary/60"
                                )}
                            >
                                <Avatar className="h-10 w-10 shrink-0">
                                    <AvatarImage src={c.avatarUrl} />
                                    <AvatarFallback>{c.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium truncate">{c.name}</span>
                                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                                            {c.role?.toLowerCase()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                                            {c.preview || "No messages yet"}
                                        </span>
                                        {c.unread > 0 && (
                                            <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-mono ml-2 shrink-0">
                                                {c.unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Right: thread */}
            {!activeUser ? (
                <div className="flex items-center justify-center text-muted-foreground text-sm">
                    Select a conversation to start messaging.
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-border flex items-center gap-3 shrink-0">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={activeUser.avatarUrl} />
                            <AvatarFallback>{activeUser.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <div className="font-medium">{activeUser.name}</div>
                            <div className="text-xs text-muted-foreground capitalize">{activeUser.role?.toLowerCase()}</div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-background">
                        {messages.length === 0 && (
                            <div className="text-center text-sm text-muted-foreground py-8">
                                No messages yet. Say hello!
                            </div>
                        )}
                        {messages.map((m) => {
                            const isMe = m.senderId === user?.id;
                            return (
                                <div
                                    key={m.id}
                                    className={cn(
                                        "max-w-[70%] px-4 py-2.5 rounded-2xl text-sm",
                                        isMe
                                            ? "ml-auto bg-primary text-primary-foreground rounded-br-md"
                                            : "bg-secondary rounded-bl-md"
                                    )}
                                >
                                    {m.content}
                                    <div className={cn(
                                        "text-[10px] font-mono mt-1 opacity-60",
                                        isMe ? "text-primary-foreground" : "text-muted-foreground"
                                    )}>
                                        {formatTime(m.createdAt)}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-border flex items-end gap-2 shrink-0">
                        <Button variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
                        <Input
                            placeholder={`Message ${activeUser.name}…`}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={handleKey}
                            className="flex-1"
                            data-testid="message-input"
                        />
                        <Button variant="ghost" size="icon"><Smile className="h-4 w-4" /></Button>
                        <Button onClick={sendMessage} disabled={sending || !draft.trim()} data-testid="message-send-btn">
                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

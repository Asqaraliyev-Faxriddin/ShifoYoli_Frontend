  "use client";

  import React, { useEffect, useRef, useState } from "react";
  import { io, Socket } from "socket.io-client";
  import { Send, Edit2, Trash2, Paperclip, ArrowLeft, Moon, Sun, File } from "lucide-react";
  import { useUserStore } from "@/store/UseUserStore";
  import axios from "axios";

  interface ChatDoctorProps {
    fullname?: string;
    doctorId: string;
    onClose: () => void;
  }

  type MsgType = "TEXT" | "FILE" | "VIDEO";

  interface Message {
    id: string;
    senderId: string;
    message: string;
    fileUrl?: string | null;
    type: MsgType;
    createdAt: string;
  }

  export default function Chat_Doctor({ fullname,doctorId, onClose }: ChatDoctorProps) {
    const { isDark, setIsDark } = useUserStore();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [user, setUser] = useState<any>(null);
    const [chatId, setChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [editing, setEditing] = useState<Message | null>(null);
    const [doctorOnline, setDoctorOnline] = useState(false);
    const [lastSeen, setLastSeen] = useState<string | null>(null);

    const fileRef = useRef<HTMLInputElement | null>(null);
    const endRef = useRef<HTMLDivElement | null>(null);
    const Base_url = "https://faxriddin.bobur-dev.uz"


    // === 1. USERNI OLIB KELISH ===
    useEffect(() => {
      (async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const { data } = await axios.get(`${Base_url}/profile/my/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data.data);
      })();
    }, []);

    // === 2. SOCKET ULASH ===
    useEffect(() => {
      if (!user) return;
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const s = io(`${Base_url}`, {
        transports: ["websocket"],
        auth: { token },
      });
      setSocket(s);

      s.on("connect", () => console.log("✅ Socket ulandi:", s.id));
      s.on("disconnect", () => console.log("❌ Ulanish uzildi"));

      s.on("chats_list", (res) => {
        const chats = Array.isArray(res) ? res : res?.data ?? [];
        if (!chats.length) {
          s.emit("create_chat", { receiverId: doctorId });
          return;
        }
        const chat = chats.find((c: any) => c.participants?.some((p: any) => p.userId === doctorId));
        if (chat) {
          setChatId(chat.id);
          s.emit("get_messages", { chatId: chat.id });
        } else {
          s.emit("create_chat", { receiverId: doctorId });
        }
      });

      s.on("chat_created", (res) => {
        setChatId(res.chatId);
      });

      // === 3. XABARLARNI OLIB KELISH ===
      s.on("messages_list", (res) => {
        const arr = Array.isArray(res.data) ? res.data : [];
        const fixed = arr.map((m: any) => {
          const fullUrl =
            m.type === "TEXT"
              ? m.message
              : m.message.startsWith("http")
              ? m.message
              : `${Base_url}/uploads/chat/${m.message}`;
          return { ...m, fileUrl: fullUrl };
        });
        console.log("📨 Xabarlar:", fixed);
        setMessages(fixed);
      });

      s.on("new_message", (msg: Message) => {
        const fullUrl =
          msg.type === "TEXT"
            ? msg.message
            : msg.message.startsWith("http")
            ? msg.message
            : `${Base_url}/uploads/chat/${msg.message}`;
        setMessages((prev) => [...prev, { ...msg, fileUrl: fullUrl }]);
      });

      s.on("message_updated", (msg: Message) => {
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, message: msg.message } : m)));
      });

      s.on("message_deleted", (payload: any) => {
        const id = payload?.id ?? payload;
        setMessages((prev) => prev.filter((m) => m.id !== id));
      });

      // === 4. ONLINE STATUS ===
      s.emit("get_online_users");

      s.on("online_users", (list: any) => {
        const online = list.includes(doctorId);
        setDoctorOnline(online);
        if (!online) setLastSeen(null);
      });

      s.on("user_online", (data: any) => {
        if (data.userId === doctorId) {
          setDoctorOnline(data.online);
          if (!data.online && data.lastSeen) setLastSeen(data.lastSeen);
        }
      });

      s.emit("get_chats", {});
      return () => {
        s.disconnect();
      };
    }, [user, doctorId]);

    useEffect(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // === 5. Xabar yuborish ===
    const sendMessage = () => {
      if (!socket || !user) return;
      const text = input.trim();
      if (!text) return;

      if (editing) {
        socket.emit("update_message", { messageId: editing.id, newText: text });
        setEditing(null);
        setInput("");
        return;
      }

      const tempMsg: Message = {
        id: "temp-" + Date.now(),
        senderId: user.id,
        message: text,
        type: "TEXT",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempMsg]);

      socket.emit("send_message", { chatId, receiverId: doctorId, message: text, type: "TEXT" });
      setInput("");
    };

    // === 6. Fayl yuborish ===
    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !socket || !user) return;
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const { data } = await axios.post(`${Base_url}/upload`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });

        const fileUrl = data.url;
        const fileType: MsgType = file.type.startsWith("video/") ? "VIDEO" : "FILE";

        const tempMsg: Message = {
          id: "temp-" + Date.now(),
          senderId: user.id,
          message: fileUrl,
          fileUrl,
          type: fileType,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempMsg]);

        socket.emit("send_message", { chatId, receiverId: doctorId, message: fileUrl, fileUrl, type: fileType });
      } catch (err) {
        console.error("❌ Fayl yuborilmadi:", err);
      }
      e.target.value = "";
    };

    const editMessage = (msg: Message) => {
      setEditing(msg);
      setInput(msg.message);
    };

    const deleteMessage = (id: string) => socket?.emit("delete_message", { messageId: id });

    const formatTime = (t: string) =>
      new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const formatLastSeen = (time: string) => {
      const d = new Date(time);
      return `Oxirgi marta ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} da ko‘rilgan`;
    };

    // === 7. UI STYLE ===
    const styles = {
      root: {
        height: "100vh",
        display: "flex",
        flexDirection: "column" as const,
        background: isDark ? "#0b1220" : "#f3f6f9",
        color: isDark ? "#e6eef8" : "#0b1826",
      },
      header: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 16px",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        background: isDark ? "#071226" : "#fff",
      },
      body: {
        flex: 1,
        overflowY: "auto" as const,
        padding: 16,
        display: "flex",
        flexDirection: "column" as const,
        gap: 12,
      },
      bubble: (mine: boolean) => ({
        alignSelf: mine ? "flex-start" : "flex-end",
        background: mine ? (isDark ? "#1f7a2b" : "#23c552") : (isDark ? "#111418" : "#0b1826"),
        color: "#fff",
        padding: "12px 16px",
        borderRadius: 16,
        maxWidth: "75%",
        position: "relative" as const,
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
      }),
      actions: {
        position: "absolute" as const,
        top: 6,
        right: 6,
        display: "flex",
        gap: 6,
        cursor: "pointer",
      },
    };

    // === 8. RENDER ===
    return (
      <div style={styles.root}>
        <div style={styles.header}>
          <button onClick={onClose}>
            <ArrowLeft />
          </button>
          <div>
            <div style={{ fontWeight: 700 }}>{fullname}</div>
            <div
              style={{
                fontSize: 13,
                color: doctorOnline ? "#16a34a" : "#dc2626",
                fontWeight: 500,
              }}
            >
              {doctorOnline
                ? "🟢 Online"
                : lastSeen
                ? formatLastSeen(lastSeen)
                : "🔴 Offline"}
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button onClick={() => setIsDark(!isDark)}>{isDark ? <Sun /> : <Moon />}</button>
          </div>
        </div>

        <div style={styles.body}>
          {messages.map((m) => {
            const mine = m.senderId === user?.id;
            const url = m.fileUrl || m.message;
            const isImg = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(url);
            const isVid = /\.(mp4|webm|ogg|mov)$/i.test(url);

            return (
              <div key={m.id} style={styles.bubble(mine)}>
               {m.type === "TEXT" && (
  <div
    className="w-[250px]"
    style={{
      wordBreak: "break-word",
      overflowWrap: "break-word",
      whiteSpace: "pre-wrap",
    }}
  >
    {m.message}
  </div>
)}

                {m.type !== "TEXT" && (
                  <>
                    {isImg ? (
                      <img src={url} alt="image" style={{ maxWidth: 300, borderRadius: 8 }} />
                    ) : isVid ? (
                      <video src={url} controls style={{ maxWidth: 300, borderRadius: 8 }} />
                    ) : (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "white", display: "flex", alignItems: "center", gap: 6 }}
                      >
                        <File size={18} /> Faylni ochish
                      </a>
                    )}
                  </>
                )}

                {mine && (
                  <div style={styles.actions}>
                    <Edit2 size={14} onClick={() => editMessage(m)} />
                    <Trash2 size={14} onClick={() => deleteMessage(m.id)} />
                  </div>
                )}
                <div style={{ fontSize: 11, opacity: 0.8, marginTop: 6, textAlign: mine ? "left" : "right" }}>
                  {formatTime(m.createdAt)}
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <div
          style={{
            padding: 10,
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderTop: "1px solid rgba(0,0,0,0.06)",
            background: isDark ? "#061123" : "#fff",
          }}
        >
          <button onClick={() => fileRef.current?.click()}>
            <Paperclip />
          </button>
          <input ref={fileRef} type="file" style={{ display: "none" }} accept="image/*,video/*" onChange={onFileChange} />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={editing ? "Xabarni tahrirlang..." : "Xabar yozing..."}
            style={{
              flex: 1,
              borderRadius: 20,
              border: "none",
              padding: "8px 12px",
              outline: "none",
              background: isDark ? "#0b2a3a" : "#f2f6fb",
              color: isDark ? "#e6eef8" : "#0b1826",
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              background: editing ? "#f59e0b" : "#1976d2",
              color: "#fff",
              borderRadius: 8,
              padding: 8,
            }}
          >
            <Send size={18} />          
          </button>
        </div>
      </div>
    );
  }

"use client";

import React, { useEffect, useRef, useState } from "react";
/** Material icons (maʼlumot uchun: npm i @mui/icons-material @mui/material @mui/system) */
import SendIcon from "@mui/icons-material/Send";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ReplyIcon from "@mui/icons-material/Reply";
import CloseIcon from "@mui/icons-material/Close";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import PhoneIcon from "@mui/icons-material/Phone";
import { DownloadIcon } from "lucide-react";
import { DownloadDone } from "@mui/icons-material";

/**
 * Chat message shape
 */
type Msg =
  | { id: string; type: "text"; text: string; replyTo?: string; edited?: boolean; time: number }
  | { id: string; type: "sticker"; sticker: string; replyTo?: string; time: number }
  | { id: string; type: "video"; url: string; mime: string; replyTo?: string; time: number }
  | { id: string; type: "image"; url: string; mime: string; replyTo?: string; time: number }
  | { id: string; type: "file"; url: string; mime: string; replyTo?: string; time: number };

export default function Chat_Doctor() {
  // Messages are client-only and will be reset on refresh (as requested)
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [showStickers, setShowStickers] = useState(false);

  // file input ref
  const fileRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when messages change (client-only)
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Utility: generate id on client only
  const genId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      // deterministic on client: only when called
      // React hydration safe because not called during render
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  };

  // Send message handler (handles edit too)
  const handleSend = () => {
    const textToSend = editId ? editingText.trim() : input.trim();
    if (!textToSend) return;

    if (editId) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === editId && m.type === "text" ? { ...m, text: textToSend, edited: true, time: Date.now() } : m
        )
      );
      setEditId(null);
      setEditingText("");
      return;
    }

    const msg: Msg = {
      id: genId(),
      type: "text",
      text: textToSend,
      replyTo: replyTo || undefined,
      time: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
    setInput("");
    setReplyTo(null);
  };

  // Delete
  const handleDelete = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  // Start edit
  const startEdit = (m: Msg) => {
    if (m.type !== "text") return;
    setEditId(m.id);
    setEditingText(m.text);
  };

  // Send sticker
  const sendSticker = (s: string) => {
    const msg: Msg = { id: genId(), type: "sticker", sticker: s, replyTo: replyTo || undefined, time: Date.now() };
    setMessages((p) => [...p, msg]);
    setShowStickers(false);
    setReplyTo(null);
  };

  // File selected
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const url = URL.createObjectURL(file);
    const mime = file.type || "application/octet-stream";
  
    let msg: Msg;
  
    if (mime.startsWith("image/")) {
      msg = { id: genId(), type: "image", url, mime, replyTo: replyTo || undefined, time: Date.now() };
    } else if (mime.startsWith("video/")) {
      msg = { id: genId(), type: "video", url, mime, replyTo: replyTo || undefined, time: Date.now() };
    } else {
      msg = { id: genId(), type: "file", url, mime, replyTo: replyTo || undefined, time: Date.now() };
    }
  
    setMessages((p) => [...p, msg]);
    if (fileRef.current) fileRef.current.value = "";
    setReplyTo(null);
  };
  
  // Open a file message (image opens in new tab, file opens in new tab / download)
  const openFile = (m: Msg) => {
    if (m.type === "image" || m.type === "file") {
      window.open(m.url, "_blank", "noopener");
    }
  };
  



  // Cancel edit
  const cancelEdit = () => {
    setEditId(null);
    setEditingText("");
  };

  // Render helpers
  const formatTime = (t: number) => {
    try {
      const d = new Date(t);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  // Styles (inline to avoid SSR style-injection mismatch)
  const styles = {
    root: {
      height: "100vh",
      display: "flex",
      flexDirection: "column" as const,
      background: isDark ? "#0f1720" : "#f3f6f9",
      color: isDark ? "#e6eef8" : "#0b1826",
      fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 16px",
      background: isDark ? "#0b1318" : "#fff",
      borderBottom: isDark ? "1px solid #12202a" : "1px solid #e6eef8",
    },
    headerLeft: { display: "flex", gap: 12, alignItems: "center" },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      background: "#2f80ed",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      fontSize: 18,
    },
    headerInfo: { display: "flex", flexDirection: "column" as const, lineHeight: 1 },
    headerRight: { display: "flex", gap: 8, alignItems: "center" },
    body: { flex: 1, overflowY: "auto" as const, padding: 16, display: "flex", flexDirection: "column" as const, gap: 12 },
    bubble: (isMine = false) => ({
      alignSelf: isMine ? "flex-end" : "flex-start",
      background: isMine ? (isDark ? "#1f6feb" : "#d9fdd3") : isDark ? "#132031" : "#fff",
      color: isMine ? (isDark ? "#fff" : "#082020") : (isDark ? "#e6eef8" : "#0b1826"),
      padding: "10px 12px",
      borderRadius: 12,
      maxWidth: "76%",
      boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
      position: "relative" as const,
    }),
    bubbleMeta: { marginTop: 6, fontSize: 11, opacity: 0.75, textAlign: "right" as const },
    controlsRow: { display: "flex", gap: 6, marginTop: 6 },
    footer: {
      padding: 10,
      borderTop: isDark ? "1px solid #12202a" : "1px solid #e6eef8",
      background: isDark ? "#0b1318" : "#fff",
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    input: {
      flex: 1,
      padding: "8px 12px",
      borderRadius: 20,
      border: "none",
      outline: "none",
      background: isDark ? "#0f2a3a" : "#f2f6fb",
      color: isDark ? "#e6eef8" : "#0b1826",
      fontSize: 15,
    },
    iconBtn: (bg?: string) => ({
      background: bg || "transparent",
      border: "none",
      padding: 8,
      borderRadius: 8,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    }),
    stickerPanel: { display: "flex", gap: 8, padding: 8, justifyContent: "center", borderTop: "1px solid rgba(0,0,0,0.06)" },
    replyPreview: { padding: "8px 12px", background: isDark ? "#07121a" : "#eef5ff", borderLeft: "3px solid #7aa7ff", display: "flex", justifyContent: "space-between", alignItems: "center" },
    fileBlock: { display: "flex", alignItems: "center", gap: 10, padding: 8, borderRadius: 8, background: isDark ? "#07121a" : "#fbfdff", cursor: "pointer" },
  };

  // NOTE: All render logic below is deterministic (no Date.now() in render; times are stored in messages created on client).
  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.avatar}>D</div>
          <div style={styles.headerInfo}>
            <div style={{ fontWeight: 700 }}>Dr. Mohira Karimova</div>
            <div style={{ fontSize: 13, color: isDark ? "#8fa6b8" : "#667887" }}>online</div>
          </div>
        </div>

        <div style={styles.headerRight}>
          <button
            aria-label="call"
            title="Call"
            style={styles.iconBtn()}
            onClick={() => {
              // For demo: just alert. In real app integrate call flow.
              alert("Qo'ng'iroq funksiyasi hali yo'q — demo.");
            }}
          >
            <PhoneIcon style={{ color: isDark ? "#e6eef8" : "#0b1826" }} />
          </button>

          <button
            aria-label="toggle-theme"
            title={isDark ? "Switch to light" : "Switch to dark"}
            style={styles.iconBtn()}
            onClick={() => setIsDark((s) => !s)}
          >
            {isDark ? <LightModeIcon style={{ color: "#ffd86b" }} /> : <DarkModeIcon style={{ color: "#0b1826" }} />}
          </button>
        </div>
      </div>

      {/* Body / messages */}
      <div style={styles.body}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: isDark ? "#7fa0b8" : "#789" }}>Chat bo'sh — birinchi xabarni yuboring</div>
        )}

        {messages.map((m) => {
          // all messages are "from user" in this demo app
          const isMine = true;
          if (m.type === "text") {
            return (
              <div key={m.id} style={styles.bubble(isMine)}>
                {m.replyTo && (
                  <div style={{ marginBottom: 6, fontSize: 12, opacity: 0.85, borderLeft: "3px solid #9fbfff", paddingLeft: 8 }}>
                    ↩️ {messages.find((x) => x.id === m.replyTo)?.type === "text" ? (messages.find((x) => x.id === m.replyTo) as any).text : "Hujjat/rasm"}
                  </div>
                )}
                <div style={{ whiteSpace: "pre-wrap" }}>{m.text}{m.edited ? " · (tahrirlangan)" : null}</div>
                <div style={styles.bubbleMeta}>{formatTime(m.time)}</div>

                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <button style={styles.iconBtn()} title="reply" onClick={() => setReplyTo(m.id)}><ReplyIcon style={{ fontSize: 18, color: isDark ? "#bcd6ef" : "#3b6fb0" }} /></button>
                  <button style={styles.iconBtn()} title="edit" onClick={() => startEdit(m)}><EditIcon style={{ fontSize: 18, color: isDark ? "#bcd6ef" : "#3b6fb0" }} /></button>
                  <button style={styles.iconBtn()} title="delete" onClick={() => handleDelete(m.id)}><DeleteIcon style={{ fontSize: 18, color: "#d45252" }} /></button>
                </div>
              </div>
            );
          } else if (m.type === "sticker") {
            return (
              <div key={m.id} style={styles.bubble(isMine)}>
                <div style={{ fontSize: 28 }}>{m.sticker}</div>
                <div style={styles.bubbleMeta}>{formatTime(m.time)}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <button style={styles.iconBtn()} title="reply" onClick={() => setReplyTo(m.id)}><ReplyIcon style={{ fontSize: 18, color: isDark ? "#bcd6ef" : "#3b6fb0" }} /></button>
                  <button style={styles.iconBtn()} title="delete" onClick={() => handleDelete(m.id)}><DeleteIcon style={{ fontSize: 18, color: "#d45252" }} /></button>
                </div>
              </div>
            );
          } else if (m.type === "image") {
            return (
              <div key={m.id} style={styles.bubble(isMine)}>
                {m.replyTo && (
                  <div style={{ marginBottom: 6, fontSize: 12, opacity: 0.85, borderLeft: "3px solid #9fbfff", paddingLeft: 8 }}>
                    ↩️ {messages.find((x) => x.id === m.replyTo)?.type === "text" ? (messages.find((x) => x.id === m.replyTo) as any).text : "Hujjat/rasm"}
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <img
                    src={m.url}
                    alt="preview"
                    style={{ maxWidth: "320px", borderRadius: 8, objectFit: "cover", boxShadow: "0 6px 18px rgba(0,0,0,0.18)" }}
                    onClick={() => openFile(m)}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 12, color: isDark ? "#9fb5c9" : "#4b647a" }}>{/* no filename shown per request */}</div>
                    <div style={{ fontSize: 12, color: isDark ? "#9fb5c9" : "#4b647a" }}>{formatTime(m.time)}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <button style={styles.iconBtn()} title="reply" onClick={() => setReplyTo(m.id)}><ReplyIcon style={{ fontSize: 18, color: isDark ? "#bcd6ef" : "#3b6fb0" }} /></button>
                  <button style={styles.iconBtn()} title="delete" onClick={() => handleDelete(m.id)}><DeleteIcon style={{ fontSize: 18, color: "#d45252" }} /></button>
                </div>
              </div>
            );
          } else if (m.type === "video") {
            return (
              <div key={m.id} style={styles.bubble(isMine)}>
                {m.replyTo && (
                  <div
                    style={{
                      marginBottom: 6,
                      fontSize: 12,
                      opacity: 0.85,
                      borderLeft: "3px solid #9fbfff",
                      paddingLeft: 8,
                    }}
                  >
                    ↩️{" "}
                    {messages.find((x) => x.id === m.replyTo)?.type === "text"
                      ? (messages.find((x) => x.id === m.replyTo) as any).text
                      : "Hujjat/video"}
                  </div>
                )}
          
                <video
                  src={m.url}
                  controls
                  style={{
                    maxWidth: "320px",
                    borderRadius: 8,
                    objectFit: "cover",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
                  }}
                />
          
                <div style={styles.bubbleMeta}>{formatTime(m.time)}</div>
          
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <button
                    style={styles.iconBtn()}
                    title="Reply"
                    onClick={() => setReplyTo(m.id)}
                  >
                    <ReplyIcon
                      style={{ fontSize: 18, color: isDark ? "#bcd6ef" : "#3b6fb0" }}
                    />
                  </button>
          
                  <button
                    style={styles.iconBtn()}
                    title="Delete"
                    onClick={() => handleDelete(m.id)}
                  >
                    <DeleteIcon style={{ fontSize: 18, color: "#d45252" }} />
                  </button>
          
                  {/* 🆕 Yuklab olish tugmasi */}
                  <a
                    href={m.url}
                    download={`video_${m.id}.mp4`}
                    style={styles.iconBtn()}
                    title="Videoni yuklab olish"
                  >
                    <DownloadIcon
                      style={{ fontSize: 18, color: isDark ? "#9fe29b" : "#2e7d32" }}
                    />
                  </a>
                </div>
              </div>
            );
          }
          
          
          
          
          else if (m.type === "file") {
            // show generic file block (no filename), show extension or "Hujjat"
            const ext = (() => {
              try {
                const parts = m.mime.split("/");
                return parts[1] ? parts[1].toUpperCase() : "FILE";
              } catch {
                return "FILE";
              }
            })();
            return (
              <div key={m.id} style={styles.bubble(isMine)}>
                {m.replyTo && (
                  <div style={{ marginBottom: 6, fontSize: 12, opacity: 0.85, borderLeft: "3px solid #9fbfff", paddingLeft: 8 }}>
                    ↩️ {messages.find((x) => x.id === m.replyTo)?.type === "text" ? (messages.find((x) => x.id === m.replyTo) as any).text : "Hujjat/rasm"}
                  </div>
                )}
                <div style={styles.fileBlock} onClick={() => openFile(m)} title="Open file">
                  <div style={{ width: 46, height: 46, borderRadius: 6, background: isDark ? "#081623" : "#eef6ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                    {ext.slice(0, 4)}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ fontWeight: 700 }}>{/* no filename shown */}Hujjat</div>
                    <div style={{ fontSize: 12, color: isDark ? "#9fb5c9" : "#4b647a" }}>{/* mime or size could go here */}</div>
                  </div>
                  <div style={{ marginLeft: "auto", fontSize: 12, color: isDark ? "#9fb5c9" : "#4b647a" }}>{formatTime(m.time)}</div>
                </div>

                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <button style={styles.iconBtn()} title="reply" onClick={() => setReplyTo(m.id)}><ReplyIcon style={{ fontSize: 18, color: isDark ? "#bcd6ef" : "#3b6fb0" }} /></button>
                  <button style={styles.iconBtn()} title="delete" onClick={() => handleDelete(m.id)}><DeleteIcon style={{ fontSize: 18, color: "#d45252" }} /></button>
                </div>
              </div>
            );
          }

          return null;
        })}

        <div ref={endRef} />
      </div>

      {/* Sticker panel */}
      {showStickers && (
        <div style={styles.stickerPanel}>
          {["😂", "❤️", "👍", "😎", "🔥", "😢", "🤗", "🎉"].map((s) => (
            <button key={s} onClick={() => sendSticker(s)} style={{ fontSize: 20, padding: 8, border: "none", background: "transparent", cursor: "pointer" }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Reply preview */}
      {replyTo && (
        <div style={styles.replyPreview}>
          <div style={{ fontSize: 13, color: isDark ? "#bcd6ef" : "#3b6fb0" }}>
            ↩️ Javob:{" "}
            <span style={{ color: isDark ? "#cfe7ff" : "#163b5a" }}>
              {(() => {
                const m = messages.find((x) => x.id === replyTo);
                if (!m) return "—";
                if (m.type === "text") return m.text.slice(0, 60) + (m.text.length > 60 ? "…" : "");
                if (m.type === "sticker") return m.sticker;
                if (m.type === "image") return "Rasm";
                return "Hujjat";
              })()}
            </span>
          </div>
          <button style={styles.iconBtn()} onClick={() => setReplyTo(null)} title="Cancel reply"><CloseIcon /></button>
        </div>
      )}

      {/* Footer / input */}
      <div style={styles.footer}>
        <button style={styles.iconBtn()} title="stickers" onClick={() => setShowStickers((s) => !s)}>
          <InsertEmoticonIcon style={{ color: isDark ? "#e6eef8" : "#0b1826" }} />
        </button>

        <button style={styles.iconBtn()} title="attach" onClick={() => fileRef.current?.click()}>
          <AttachFileIcon style={{ color: isDark ? "#e6eef8" : "#0b1826" }} />
        </button>
        <input ref={fileRef} type="file" style={{ display: "none" }} onChange={onFileChange} />

        {/* If editing, show editingText; otherwise normal input */}
        <input
          aria-label={editId ? "editing" : "message"}
          value={editId ? editingText : input}
          onChange={(e) => (editId ? setEditingText(e.target.value) : setInput(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
            if (e.key === "Escape" && editId) cancelEdit();
          }}
          placeholder={editId ? "Xabarni tahrirlang..." : "Xabar yozing..."}
          style={styles.input}
        />

        {/* If editing show cancel button */}
        {editId ? (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={cancelEdit} style={styles.iconBtn()}>
              <CloseIcon style={{ color: isDark ? "#fff" : "#0b1826" }} />
            </button>
            <button onClick={handleSend} style={{ ...styles.iconBtn(), background: "#1976d2", color: "#fff" }}>
              <SendIcon />
            </button>
          </div>
        ) : (
          <button onClick={handleSend} style={{ ...styles.iconBtn(), background: "#1976d2", color: "#fff" }}>
            <SendIcon />
          </button>
        )}
      </div>
    </div>
  );
}

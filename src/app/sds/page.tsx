"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  InsertEmoticon,
  AttachFile,
  Delete,
  Edit,
  Reply,
  Close,
  DarkMode,
  LightMode,
} from "@mui/icons-material";
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Paper,
  Button,
} from "@mui/material";

const Chat_Doctor = () => {
  const [messages, setMessages] = useState<
    { id: string; text: string; reply?: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() === "") return;
    if (editId) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === editId ? { ...msg, text: editingText } : msg
        )
      );
      setEditId(null);
      setEditingText("");
      return;
    }

    const newMsg = {
      id: Date.now().toString(),
      text: input,
      reply: replyTo ? messages.find((m) => m.id === replyTo)?.text : undefined,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setReplyTo(null);
  };

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  const startEdit = (id: string, text: string) => {
    setEditId(id);
    setEditingText(text);
  };

  const sendSticker = (sticker: string) => {
    const newMsg = {
      id: Date.now().toString(),
      text: sticker,
    };
    setMessages((prev) => [...prev, newMsg]);
    setShowStickers(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newMsg = {
        id: Date.now().toString(),
        text: `📎 Fayl: ${file.name}`,
      };
      setMessages((prev) => [...prev, newMsg]);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: isDark ? "#121212" : "#f5f5f5",
        color: isDark ? "white" : "black",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: isDark ? "#1e1e1e" : "white",
          boxShadow: 1,
        }}
      >
        <Typography variant="h6">👨‍⚕️ Shifokor bilan chat</Typography>
        <IconButton onClick={() => setIsDark(!isDark)}>
          {isDark ? <LightMode /> : <DarkMode />}
        </IconButton>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {messages.map((msg) => (
          <Paper
            key={msg.id}
            sx={{
              p: 1.5,
              bgcolor: isDark ? "#2c2c2c" : "white",
              alignSelf: "flex-start",
              maxWidth: "70%",
            }}
          >
            {msg.reply && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  opacity: 0.7,
                  borderLeft: "3px solid gray",
                  pl: 1,
                  mb: 0.5,
                }}
              >
                ↩️ {msg.reply}
              </Typography>
            )}

            <Typography>{msg.text}</Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
              <IconButton size="small" onClick={() => setReplyTo(msg.id)}>
                <Reply fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => startEdit(msg.id, msg.text)}
              >
                <Edit fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => deleteMessage(msg.id)}>
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Sticker panel */}
      {showStickers && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            p: 1,
            borderTop: "1px solid gray",
            bgcolor: isDark ? "#222" : "white",
            justifyContent: "center",
          }}
        >
          {["😂", "❤️", "👍", "😎", "🔥", "😢"].map((s) => (
            <Button key={s} onClick={() => sendSticker(s)}>
              {s}
            </Button>
          ))}
        </Box>
      )}

      {/* Reply bar */}
      {replyTo && (
        <Box
          sx={{
            p: 1,
            bgcolor: isDark ? "#2c2c2c" : "#e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2">
            ↩️ {messages.find((m) => m.id === replyTo)?.text}
          </Typography>
          <IconButton onClick={() => setReplyTo(null)}>
            <Close />
          </IconButton>
        </Box>
      )}

      {/* Input */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          p: 1,
          borderTop: "1px solid gray",
          bgcolor: isDark ? "#1e1e1e" : "white",
        }}
      >
        <IconButton onClick={() => setShowStickers(!showStickers)}>
          <InsertEmoticon />
        </IconButton>

        <IconButton onClick={() => fileInputRef.current?.click()}>
          <AttachFile />
        </IconButton>
        <input
          type="file"
          hidden
          ref={fileInputRef}
          onChange={handleFileSelect}
        />

        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder={
            editId ? "Xabarni tahrirlang..." : "Xabar yozing..."
          }
          value={editId ? editingText : input}
          onChange={(e) =>
            editId ? setEditingText(e.target.value) : setInput(e.target.value)
          }
        />

        <IconButton
          color="primary"
          onClick={sendMessage}
          sx={{ bgcolor: "#1976d2", color: "white", "&:hover": { bgcolor: "#115293" } }}
        >
          <Send />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chat_Doctor;

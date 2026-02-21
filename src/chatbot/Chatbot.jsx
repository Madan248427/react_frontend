import React, { useState, useRef, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Button, Card } from "antd";
import { MessageOutlined, CloseOutlined, SendOutlined } from "@ant-design/icons";
import "./Chatbot.css";

/*
 * ============================================================
 *  FIX: DO NOT USE axiosInstance FOR CHATBOT API CALLS
 * ============================================================
 *
 *  ROOT CAUSE OF THE PAGE REFRESH:
 *  - axiosInstance has a response interceptor that catches 401
 *    errors and does: window.location.href = "/login"
 *  - When the user is NOT logged in, fetchJWTFromBackend() calls
 *    axiosInstance.get("/accounts/rasa-token/") → gets 401 →
 *    interceptor fires → window.location.href = "/login" →
 *    FULL PAGE REFRESH
 *  - When logged IN, the request succeeds (200), so the
 *    interceptor never fires. That's why it only breaks on logout.
 *
 *  SOLUTION:
 *  - Use plain fetch() for ALL chatbot API calls
 *  - fetch() has no interceptors, so 401 is caught silently
 *  - The Rasa webhook doesn't need auth cookies anyway
 * ============================================================
 */

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  /* =============================
     AUTO SCROLL
  ============================== */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  /* =============================
     OPTIONAL JWT FETCH
     Uses plain fetch() - NOT axiosInstance
     So 401 is caught silently without
     triggering any interceptor redirect
  ============================== */
  const fetchJWTFromBackend = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/accounts/rasa-token/",
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        // User not logged in - that's fine, return null silently
        return null;
      }

      const data = await response.json();
      return data?.jwt_token || null;
    } catch {
      // Network error or user not logged in - return null silently
      return null;
    }
  };

  /* =============================
     SEND MESSAGE
     Uses plain fetch() for Rasa webhook too
  ============================== */
  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage = { sender: "user", text: trimmed };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Re-focus the input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    try {
      const jwtToken = await fetchJWTFromBackend();

      const payload = {
        sender: "user",
        message: userMessage.text,
        metadata: {
          jwt_token: jwtToken || null,
        },
      };

      // Use plain fetch() for Rasa webhook - NOT axiosInstance
      const response = await fetch(
        "http://localhost:5005/webhooks/rest/webhook",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Rasa server error");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        data.forEach((res) => {
          if (res.text) {
            setMessages((prev) => [
              ...prev,
              { sender: "bot", text: res.text },
            ]);
          }
        });
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Server error. Try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /* =============================
     HANDLE ENTER KEY TO SEND
     No <form> used - pure keyboard handling
  ============================== */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (e.nativeEvent) {
        e.nativeEvent.stopImmediatePropagation();
      }
      if (!isLoading && input.trim()) {
        sendMessage();
      }
    }
  };

  /* =============================
     UI
  ============================== */
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ flex: 1, overflow: "auto" }}>
        <Outlet />
      </div>

      {isOpen && (
        <Card
          id="chatbot-container"
          title={
            <span className="chatbot-title">
              {"Marvel Nexus"} <span className="chatbot-title-icon">{"📚"}</span>
            </span>
          }
          size="small"
          className="chatbot-card"
          bodyStyle={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "auto",
            padding: "12px",
          }}
          extra={
            <CloseOutlined
              onClick={toggleChat}
              style={{ cursor: "pointer", color: "#fff" }}
            />
          }
        >
          {/* CHAT AREA */}
          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="chatbot-welcome">
                {"Hi! How can I help you find books today?"}
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chatbot-msg ${msg.sender === "user" ? "chatbot-msg-user" : "chatbot-msg-bot"}`}
              >
                <span
                  className={`chatbot-bubble ${msg.sender === "user" ? "chatbot-bubble-user" : "chatbot-bubble-bot"}`}
                >
                  {msg.text}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="chatbot-msg chatbot-msg-bot">
                <span className="chatbot-bubble chatbot-bubble-bot chatbot-typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/*
            NO <form> TAG - plain div with native input.
            Enter key handled via onKeyDown.
            Send button uses type="button" with onClick.
          */}
          <div className="chatbot-input-area">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="chatbot-native-input"
              autoComplete="off"
            />

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                sendMessage();
              }}
              disabled={isLoading || !input.trim()}
              className="chatbot-send-btn"
            >
              {isLoading ? (
                <span className="chatbot-spinner"></span>
              ) : (
                <SendOutlined />
              )}
            </button>
          </div>
        </Card>
      )}

      {!isOpen && (
        <Button
          type="primary"
          icon={<MessageOutlined />}
          onClick={toggleChat}
          className="chatbot-toggle-btn"
        />
      )}
    </div>
  );
};

export default Chatbot;

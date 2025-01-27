import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const OllamaChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const parseContent = (content: string | undefined) => {
    if (!content) return [{ type: "text", content: "", lang: "" }];
    
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    const parts: { type: "text" | "code"; content: string; lang: string }[] = [];
    let lastIndex = 0;

    let match;
    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.slice(lastIndex, match.index).trim(),
          lang: "",
        });
      }

      parts.push({
        type: "code",
        content: match[2].trim(),
        lang: match[1] || "text",
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex).trim(),
        lang: "",
      });
    }

    return parts.length ? parts : [{ type: "text", content, lang: "" }];
  };

  const renderMessage = (msg: Message) => {
    if (msg.role === "user") {
      return <div className="text-right text-white font-medium">{msg.content}</div>;
    }

    const parsedContent = parseContent(msg.content);
    return (
      <div className="text-left text-white space-y-2">
        {parsedContent.map((part, idx) => (
          part.type === "text" ? (
            <p key={idx} className="whitespace-pre-wrap">{part.content}</p>
          ) : (
            <SyntaxHighlighter
              key={idx}
              language={part.lang}
              style={atomDark}
              className="rounded-lg text-sm"
            >
              {part.content}
            </SyntaxHighlighter>
          )
        ))}
      </div>
    );
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error('API URL is not defined');
      }
      const response = await axios.post(process.env.NEXT_PUBLIC_API_URL, {
        model: "llama3:8b",
        stream: false,
        messages: [...messages, newMessage],
      });

      if (response.data?.message) {
        const aiMessage: Message = {
          role: "assistant",
          content: response.data.message.content || "No response received",
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error: any) {
      console.error("Error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Error: ${error.message}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow-lg rounded-xl">
      <h1 className="text-2xl font-bold text-black text-center mb-4">
        Welcome to Ollama Chat
      </h1>
      <motion.div
        className="border-2 border-slate-200 rounded-lg p-4 h-[28rem] overflow-y-auto mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`mb-3 p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-indigo-500 text-white self-end"
                  : "bg-emerald-500 text-white self-start"
              }`}
            >
              {renderMessage(msg)}
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div
            className="text-center text-black flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              repeat: Infinity,
              duration: 0.8,
              repeatType: "reverse",
            }}
          >
            <Loader2 className="mr-2 animate-spin" />
            Generating response...
          </motion.div>
        )}
      </motion.div>
      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          className="flex-grow border-2 border-slate-300 rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
          placeholder="Type your message..."
        />
        <motion.button
          onClick={sendMessage}
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-indigo-600 text-white px-4 py-3 rounded-r-lg flex items-center disabled:opacity-50"
        >
          <Send className="mr-2" size={20} />
          Send
        </motion.button>
      </div>
    </div>
  );
};

export default OllamaChat;
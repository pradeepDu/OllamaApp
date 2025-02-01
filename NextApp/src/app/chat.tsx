import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send, LogOut, Mic, MicOff } from "lucide-react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "./utils/firebaseConfig";
import { apiUrl } from "./utils/apiRouter";
import { AuroraBackground } from "./components/aceternity/aurora-background";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const OllamaChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const startListening = async () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    try {
      // Call the Express server endpoint that runs the Python script
      const response = await axios.post(`${apiUrl}/api/speech-recognition`);
      
      if (response.data?.text) {
        // Remove any trailing newlines or whitespace from the Python output
        const recognizedText = response.data.text.trim();
        setInput(current => current + ' ' + recognizedText);
      }
    } catch (error) {
      console.error("Speech recognition error:", error);
      alert("Error with speech recognition. Please try again.");
    } finally {
      setIsListening(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const idToken = await user?.getIdToken();
      const response = await axios.post(
        `${apiUrl}/api/chat`,
        {
          model: "llama3:8b",
          stream: false,
          messages: [...messages, newMessage],
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (response.data?.message) {
        const aiMessage: Message = {
          role: "assistant",
          content: response.data.message.content || "No response received",
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <AuroraBackground>
      <div className="w-[48rem] mx-auto p-6 bg-black/80 backdrop-blur-md shadow-lg rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">Ollama Chat</h1>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-300">
              {user.displayName || user.email}
            </span>
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-3 py-1 rounded-md flex items-center shadow-md"
            >
              <LogOut className="mr-2" size={16} />
              Logout
            </motion.button>
          </div>
        </div>

        <motion.div
          className="border-2 border-gray-800 rounded-lg p-4 h-[32rem] w-full overflow-y-auto mb-4 bg-black/50 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col space-y-4">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`mb-3 p-3 rounded-lg w-fit ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white ml-auto max-w-[80%]"
                      : "bg-gray-800 text-white mr-auto max-w-[80%]"
                  }`}
                >
                  {msg.content}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {loading && (
            <motion.div
              className="text-center text-white flex justify-center items-center mt-4"
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

        <div className="flex w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            className="flex-grow bg-gray-900 text-white border-2 border-gray-800 rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
            placeholder="Type your message..."
          />

          <motion.button
            onClick={startListening}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`px-4 py-3 ${isListening ? "bg-red-500" : "bg-green-500"} text-white`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </motion.button>

          <motion.button
            onClick={sendMessage}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-r-lg flex items-center disabled:opacity-50"
          >
            <Send className="mr-2" size={20} />
            Send
          </motion.button>
        </div>
      </div>
    </AuroraBackground>
  );
};

export default OllamaChat;
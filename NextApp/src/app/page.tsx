"use client";

import React from "react";
import Image from "next/image";
import OllamaChat from "./chat"

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Welcome to Ollama Chat</h1>
      <OllamaChat />
    </div>
  );
};

export default Home;

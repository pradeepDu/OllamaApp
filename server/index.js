const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const { spawn } = require("child_process"); // For running the Python script

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// POST endpoint to handle speech recognition
app.post("/api/speech-recognition", (req, res) => {
  const python = spawn('python', ['speech.py']); // Run the Python script

  // Collect data from the Python script
  python.stdout.on('data', (data) => {
    console.log(`Python script output: ${data}`);
    res.status(200).json({ text: data.toString() });
  });

  // Error handling
  python.stderr.on('data', (data) => {
    console.error(`Python error: ${data}`);
    res.status(500).json({ error: data.toString() });
  });

  // End the process after the speech recognition is done
  python.on('close', (code) => {
    if (code !== 0) {
      console.error(`Python script exited with code ${code}`);
    }
  });
});

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "deepseek-r1:8b",
      prompt: messages[messages.length - 1].content,
      stream: false
    });

    res.status(200).json({
      message: {
        role: "assistant",
        content: response.data.response
      }
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

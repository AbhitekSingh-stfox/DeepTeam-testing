# Chatbot 🤖

A full-stack, AI-powered chatbot application featuring a responsive **React (Vite)** frontend, a robust **Python** backend, and integrated **audio processing capabilities** for voice interactions.

---

## 📁 Project Structure

Based on the repository layout, the project is divided into the following directories:

```text
Chatbot/
├── backend/            # Python server, APIs, and data models
│   ├── main.py        # Main backend application entry point
│   ├── frontend.py    # Backend UI / routing helper
│   └── data.json      # Local data storage / configurations
├── frontend/           # React + Vite production web app
│   ├── src/
│   │   ├── pages/
│   │   │   └── Chatbot.jsx  # Core Chatbot interface component
│   │   ├── App.jsx          # Main React Application component
│   │   └── main.jsx         # React application entry point
├── audio/              # Managed audio assets (.mp3, .wav) for voice processing
└── .gitignore          # Safeguard for private environment keys and dependencies

✨ Features

Interactive Chat Interface: Smooth, real-time conversational UI built with React.

Python Backend Ecosystem: High-performance server logic to handle API requests and user data safely.

Voice & Audio Integration: Dedicated audio processing infrastructure supporting speech components (.mp3/.wav).

Security First: Configured to dynamically ignore environment variables and local cache modules.

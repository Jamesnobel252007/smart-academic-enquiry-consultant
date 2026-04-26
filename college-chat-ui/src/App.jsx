import { useState, useEffect, useRef } from "react";
import "./App.css";
import avatar from "./assets/avt.png";
import responses from "./data/college_data.json";

function App() {
  const welcomeText =
    "SYSTEM ONLINE: SAEC AI Consultant initialized. How may I assist your academic journey today?";

  const [messages, setMessages] = useState([]);
  const [displayedMessages, setDisplayedMessages] = useState({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarBubble, setAvatarBubble] = useState(welcomeText);
  const [typedAvatarBubble, setTypedAvatarBubble] = useState("");
  const [isDark] = useState(true);
  const [voices, setVoices] = useState([]);
  const [conversationState, setConversationState] = useState({
    intent: null,
    step: null,
    data: {}
  });

  const chatEndRef = useRef(null);
  const avatarTypingIntervalRef = useRef(null);
  const messageTypingIntervalsRef = useRef({});
  const welcomeSpokenRef = useRef(false);

  const deptMap = {
    it: "IT department",
    csbs: "CSBS department",
    cse: "CSE department",
    aids: "AIDS department"
  };

  const placeMap = {
    ramnad: "ramnad",
    rameshwaram: "Rameshwaram",
    mandapam: "mandapam",
    manamadurai: "Manamadurai",
    paramakudi: "paramakudi"
  };

  const labMap = {
    "a.i.d.s lab": "A.I.D.S lab",
    "aids lab": "A.I.D.S lab",
    aids: "A.I.D.S lab",
    "main lab": "Main lab",
    "programming lab 1": "programming lab 1",
    "pg lab 1": "Pg lab 1 ",
    "programming lab 2": "Programing lab 2",
    "pg lab 2": "Pg lab 2 ",
    "cadd lab": "CADD lab",
    cadd: "CADD lab"
  };

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
      if (avatarTypingIntervalRef.current) {
        clearInterval(avatarTypingIntervalRef.current);
      }
      Object.values(messageTypingIntervalsRef.current).forEach(clearInterval);
    };
  }, []);

  useEffect(() => {
    if (avatarTypingIntervalRef.current) {
      clearInterval(avatarTypingIntervalRef.current);
    }

    let index = 0;
    setTypedAvatarBubble("");

    avatarTypingIntervalRef.current = setInterval(() => {
      index += 1;
      setTypedAvatarBubble(avatarBubble.slice(0, index));

      if (index >= avatarBubble.length) {
        clearInterval(avatarTypingIntervalRef.current);
      }
    }, 20);

    return () => {
      if (avatarTypingIntervalRef.current) {
        clearInterval(avatarTypingIntervalRef.current);
      }
    };
  }, [avatarBubble]);

  useEffect(() => {
    messages.forEach((msg) => {
      if (displayedMessages[msg.id] === msg.text) return;
      if (messageTypingIntervalsRef.current[msg.id]) return;

      let charIndex = 0;

      messageTypingIntervalsRef.current[msg.id] = setInterval(() => {
        charIndex += 2;
        setDisplayedMessages((prev) => ({
          ...prev,
          [msg.id]: msg.text.slice(0, charIndex)
        }));

        if (charIndex >= msg.text.length) {
          clearInterval(messageTypingIntervalsRef.current[msg.id]);
          delete messageTypingIntervalsRef.current[msg.id];
        }
      }, 15);
    });
  }, [messages, displayedMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, displayedMessages, loading]);

  const cleanTextForSpeech = (text) => {
    return text
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
      .replace(/[^\w\s.,!?:'/-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const extractGreeting = (text) => {
    if (!text) return "DATA READY.";
    const firstPart = text.split("\n\n")[0]?.trim();
    return firstPart || "DATA READY.";
  };

  const extractCoreAnswer = (text) => {
    if (!text) return "Sorry, I could not get a response.";

    const parts = text.split("\n\n").map((p) => p.trim()).filter(Boolean);

    if (parts.length >= 2) {
      return parts.slice(1).join("\n\n");
    }

    return text.trim();
  };

  const getFemaleVoice = () => {
    return (
      voices.find((v) => v.name.toLowerCase().includes("zira")) ||
      voices.find((v) => v.name.toLowerCase().includes("samantha")) ||
      voices.find((v) => v.name.toLowerCase().includes("female")) ||
      voices.find((v) =>
        v.name.toLowerCase().includes("google uk english female")
      ) ||
      voices.find((v) => v.name.toLowerCase().includes("google")) ||
      voices[0]
    );
  };

  const speakText = (text) => {
    const speechText = cleanTextForSpeech(text);
    if (!speechText) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.92;
    utterance.pitch = 1.12;
    utterance.volume = 1;

    const femaleVoice = getFemaleVoice();
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 120);
  };

  useEffect(() => {
    if (!welcomeSpokenRef.current && voices.length > 0) {
      welcomeSpokenRef.current = true;
      speakText(welcomeText);
    }
  }, [voices]);

  useEffect(() => {
    const startWelcomeOnFirstInteraction = () => {
      if (!welcomeSpokenRef.current) {
        welcomeSpokenRef.current = true;
        speakText(welcomeText);
      }

      window.removeEventListener("click", startWelcomeOnFirstInteraction);
      window.removeEventListener("keydown", startWelcomeOnFirstInteraction);
    };

    window.addEventListener("click", startWelcomeOnFirstInteraction);
    window.addEventListener("keydown", startWelcomeOnFirstInteraction);

    return () => {
      window.removeEventListener("click", startWelcomeOnFirstInteraction);
      window.removeEventListener("keydown", startWelcomeOnFirstInteraction);
    };
  }, [voices]);

  const formatAnswerForDisplay = (text) => {
    if (!text) return "";

    let formatted = text;

    formatted = formatted.replace(/(💰|📍|🍽️|🧪|🚌|📅|🏨|📚)/g, "\n$1");
    formatted = formatted.replace(/([A-Za-z. ]+):/g, "\n$1:");
    formatted = formatted.replace(/(HOD:|Tuition Fee:|Hostel Fee:)/g, "\n  • $1");
    formatted = formatted.replace(/\.\s*/g, ".\n");
    formatted = formatted.replace(/\n{3,}/g, "\n\n").trim();

    return formatted;
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied!");
    } catch {
      alert("Copy failed");
    }
  };

  const handleEdit = (id) => {
    const msg = messages.find((m) => m.id === id);
    if (!msg || msg.sender !== "user") return;

    setInput(msg.text);
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setAvatarBubble("Editing your question...");
  };

  const formatFeeAnswer = (deptName, placeName) => {
    const deptInfo = responses.fees.dept[deptName];
    const busFee = responses.fees.bus_fee[placeName];

    let answer = `💰 Fee structure for ${deptName}:\n`;
    answer += `HOD: ${deptInfo.HOD}\n`;
    answer += `Tuition Fee: ${deptInfo.tuition_fee}\n`;
    answer += `Hostel Fee: ${deptInfo.hostel_fee}\n`;

    if (busFee) {
      answer += `\n🚌 Bus Fee for ${placeName}: Rs. ${busFee}`;
    } else {
      answer += `\n🚌 Bus fee not found for ${placeName}.`;
    }

    return formatAnswerForDisplay(answer);
  };

  const formatLabAnswer = (labName) => {
    const location = responses.labs[labName];
    if (!location) return "Lab information not found.";
    return formatAnswerForDisplay(`🧪 ${labName} location:\n${location}`);
  };

  const createBotMessage = (text) => ({
    id: Date.now() + Math.floor(Math.random() * 1000),
    sender: "saec",
    text
  });

 const handleSend = async () => {
  if (!input.trim() || loading) return;

  const currentInput = input.trim();
  const lowerInput = currentInput.toLowerCase();

  const userMsg = {
    id: Date.now(),
    sender: "user",
    text: currentInput
  };

  setInput("");
  setMessages((prev) => [...prev, userMsg]);

  if (conversationState.intent === "fees") {
    if (conversationState.step === "department") {
      const deptKey = Object.keys(deptMap).find((key) =>
        lowerInput.includes(key)
      );

      if (deptKey) {
        const selectedDept = deptMap[deptKey];
        const botMsg = createBotMessage(
          "🚌 Where are you from for bus fee details?"
        );

        setMessages((prev) => [...prev, botMsg]);
        setAvatarBubble("Waiting for your place details.");
        speakText(botMsg.text);

        setConversationState({
          intent: "fees",
          step: "place",
          data: { department: selectedDept }
        });
        return;
      } else {
        const botMsg = createBotMessage(
          "Please tell me a valid department like IT, CSBS, CSE, or AIDS."
        );

        setMessages((prev) => [...prev, botMsg]);
        setAvatarBubble("Department not recognized.");
        speakText(botMsg.text);
        return;
      }
    }

    if (conversationState.step === "place") {
      const placeKey = Object.keys(placeMap).find((key) =>
        lowerInput.includes(key)
      );

      const selectedDept = conversationState.data.department;

      if (placeKey) {
        const selectedPlace = placeMap[placeKey];
        const finalAnswer = formatFeeAnswer(selectedDept, selectedPlace);

        const botMsg = createBotMessage(finalAnswer);

        setMessages((prev) => [...prev, botMsg]);
        setAvatarBubble("Fee details ready.");
        speakText(finalAnswer);

        setConversationState({
          intent: null,
          step: null,
          data: {}
        });
        return;
      } else {
        const botMsg = createBotMessage(
          "Please tell me a valid place like Rameshwaram, Ramnad, Mandapam, Manamadurai, or Paramakudi."
        );

        setMessages((prev) => [...prev, botMsg]);
        setAvatarBubble("Place not recognized.");
        speakText(botMsg.text);
        return;
      }
    }
  }

  if (conversationState.intent === "labs") {
    if (conversationState.step === "lab_name") {
      const labKey = Object.keys(labMap).find((key) =>
        lowerInput.includes(key)
      );

      if (labKey) {
        const selectedLab = labMap[labKey];
        const finalAnswer = formatLabAnswer(selectedLab);

        const botMsg = createBotMessage(finalAnswer);

        setMessages((prev) => [...prev, botMsg]);
        setAvatarBubble("Lab location ready.");
        speakText(finalAnswer);

        setConversationState({
          intent: null,
          step: null,
          data: {}
        });
        return;
      } else {
        const botMsg = createBotMessage(
          "Please tell me a valid lab like A.I.D.S lab, Main lab, Programming lab 1, Programming lab 2, or CADD lab."
        );

        setMessages((prev) => [...prev, botMsg]);
        setAvatarBubble("Lab name not recognized.");
        speakText(botMsg.text);
        return;
      }
    }
  }

  setLoading(true);
  setAvatarBubble(`DECRYPTING_REQUEST: "${currentInput.substring(0, 20)}..."`);

  try {
    const response = await fetch("http://127.0.0.1:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: currentInput })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Backend response:", data);

    const rawReply = data.reply || "Sorry, I couldn't get a response.";
    const predictedIntent = data.intent;

    if (predictedIntent === "fees") {
      const botMsg = createBotMessage(
        "💰 Which department do you want to know?"
      );

      setMessages((prev) => [...prev, botMsg]);
      setAvatarBubble("Waiting for department details.");
      speakText(botMsg.text);

      setConversationState({
        intent: "fees",
        step: "department",
        data: {}
      });
      return;
    }

    if (predictedIntent === "labs") {
      const botMsg = createBotMessage(
        "🧪 Which lab do you want to know?"
      );

      setMessages((prev) => [...prev, botMsg]);
      setAvatarBubble("Waiting for lab name.");
      speakText(botMsg.text);

      setConversationState({
        intent: "labs",
        step: "lab_name",
        data: {}
      });
      return;
    }

    const greeting = extractGreeting(rawReply);
    const answerText = extractCoreAnswer(rawReply);

    const botMsg = createBotMessage(formatAnswerForDisplay(answerText));

    setMessages((prev) => [...prev, botMsg]);
    setAvatarBubble(greeting);
    speakText(answerText);
  } catch (err) {
    console.error("Frontend fetch error:", err);

    const errorText = `CRITICAL ERROR: ${err.message}`;

    const errorMsg = createBotMessage(errorText);

    setMessages((prev) => [...prev, errorMsg]);
    setAvatarBubble("CONNECTION FAILURE DETECTED.");
    speakText(errorText);
  } finally {
    setLoading(false);
  }
};

  const isTypingDone = (msg) => displayedMessages[msg.id] === msg.text;

  return (
    <div className={`app-viewport ${isDark ? "theme-dark" : "theme-light"}`}>
      <div className="futuristic-container">
        <aside className="cyber-sidebar">
          <div className="system-status">
            <div className="scanner-line"></div>
            <span>PROTOCOL: ACTIVE</span>
          </div>

          <div className="ai-core">
            <div className="glow-ring"></div>

            <div className="data-bubble">
              {typedAvatarBubble}
              {typedAvatarBubble !== avatarBubble && (
                <span className="terminal-cursor">_</span>
              )}
            </div>

            <img src={avatar} alt="Core" className="ai-hologram" />
          </div>
        </aside>

        <main className="terminal-chat">
          <header className="terminal-header">
            <div className="header-labels">
              <h1>SAEC_CORE_v3</h1>
              <p>PREDICTIVE ADMISSIONS & CAMPUS INTELLIGENCE</p>
            </div>
            <div className="node-info">NODE_01</div>
          </header>

          <div className="message-flow">
            {messages.map((msg) => (
              <div key={msg.id} className={`cyber-msg ${msg.sender}`}>
                <div className="msg-tag">[{msg.sender.toUpperCase()}]</div>
                <div className="msg-body">
                  {displayedMessages[msg.id] || ""}
                  {!isTypingDone(msg) && <span className="cursor-block"></span>}
                </div>
              </div>
            ))}

            {loading && (
              <div className="cyber-msg bot loading-state">ANALYZING...</div>
            )}

            <div ref={chatEndRef}></div>
          </div>

          <div className="input-wrap">
            <div className="input-bracket left">[</div>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="ENTER COMMAND OR QUERY..."
            />
            <div className="input-bracket right">]</div>
            <button className="neon-btn" onClick={handleSend} disabled={loading}>
              EXECUTE
            </button>
          </div>

          <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
            <button
              className="neon-btn"
              onClick={() => {
                const lastBot = [...messages].reverse().find((m) => m.sender === "saec");
                if (lastBot) speakText(lastBot.text);
              }}
            >
              REPLAY VOICE
            </button>

            <button
              className="neon-btn"
              onClick={() => {
                window.speechSynthesis.cancel();
              }}
            >
              STOP VOICE
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
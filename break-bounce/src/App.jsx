import { useState, useEffect, useRef } from "react";
import PhysicsCanvas from "./PhysicsCanvas";
import "./App.css";

const THEMES = {
  cats: {
    name: "Workout Cats",
    creatures: ["🐱", "🐈", "😸", "🙀", "😹", "😻"],
  },
  spooky: {
    name: "Skulls & Spooky",
    creatures: ["💀", "👻", "🦇", "🕷️ ", "☠️ ", "🫀"],
  },
  goblins: { name: "Goblins", creatures: ["👺", "😈", "👿", "🔥", "🤬", "💢"] },
  vibes: { name: "Vibes", creatures: ["🌈", "✨", "🪩", "💫", "⭐", "🎉"] },
  cursed: { name: "Cursed", creatures: ["🤡", "👁️ ", "🦷", "🧿", "🫁", "🩸"] },
};

const INTERVALS = [
  { label: "15 min", value: 15 * 60 * 1000 },
  { label: "30 min", value: 30 * 60 * 1000 },
  { label: "45 min", value: 45 * 60 * 1000 },
  { label: "60 min", value: 60 * 60 * 1000 },
  { label: "Test (10s)", value: 10 * 1000 },
];

const TALLY_GOAL = 5;

function getDailyTheme() {
  const today = new Date().toDateString();
  const stored = localStorage.getItem("breakBounceTheme");
  if (stored) {
    const { date, key } = JSON.parse(stored);
    if (date === today) return THEMES[key];
  }
  const keys = Object.keys(THEMES);
  const key = keys[Math.floor(Math.random() * keys.length)];
  localStorage.setItem(
    "breakBounceTheme",
    JSON.stringify({ date: today, key }),
  );
  return THEMES[key];
}

function getSavedInterval() {
  const saved = localStorage.getItem("breakBounceInterval");
  return saved ? parseInt(saved) : 45 * 60 * 1000;
}

function getSavedTally() {
  const saved = localStorage.getItem("breakBounceTally");
  return saved ? parseInt(saved) : 0;
}

const COMMANDS = [
  { title: "Stand up, mortal!", subtitle: "Touch your toes for 30 seconds." },
  {
    title: "The goblin demands movement.",
    subtitle: "Do 10 jumping jacks. Now.",
  },
  {
    title: "Your chair is a trap.",
    subtitle: "Stand up and stretch your arms above your head.",
  },
  {
    title: "Silence, desk creature.",
    subtitle: "Walk to another room and back. Go.",
  },
  {
    title: "The ancient law requires it.",
    subtitle: "Roll your shoulders 5 times. Both directions.",
  },
  {
    title: "You have been sitting too long.",
    subtitle: "March in place for 30 seconds.",
  },
];

let currentCtx = null;

async function playAlarm() {
  if (currentCtx) currentCtx.close();
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  currentCtx = ctx;
  await ctx.resume();
  const notes = [659, 523, 659, 784, 659];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = "square";
    const start = ctx.currentTime + i * 0.25;
    gain.gain.setValueAtTime(0.5, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
    osc.start(start);
    osc.stop(start + 0.3);
  });
}

function stopAlarm() {
  if (currentCtx) {
    currentCtx.close();
    currentCtx = null;
  }
}

function Header({ tally, onSettings }) {
  return (
    <div className="header">
      <span className="header-title">Break Bounce 👺</span>
      <div className="tally-tab">
        <span>Goblin Tally:</span>
        <div className="tally-pips">
          {Array.from({ length: TALLY_GOAL }, (_, i) => (
            <div key={i} className={`pip ${i < tally ? "filled" : ""}`} />
          ))}
        </div>
        <span>
          {tally}/{TALLY_GOAL}
        </span>
      </div>
      <button className="settings-btn" onClick={onSettings}>
        🕰️{" "}
      </button>
    </div>
  );
}

function App() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [done, setDone] = useState(false);
  const [command, setCommand] = useState(COMMANDS[0]);
  const [theme] = useState(() => getDailyTheme());
  const [interval, setIntervalValue] = useState(() => getSavedInterval());
  const [tally, setTally] = useState(() => getSavedTally());
  const alarmRef = useRef(null);
  const overlayActiveRef = useRef(false);
  const breakTimerRef = useRef(null);

  function triggerGoblin() {
    overlayActiveRef.current = true;
    const random = COMMANDS[Math.floor(Math.random() * COMMANDS.length)];
    setCommand(random);
    setSecondsLeft(30);
    setDone(false);
    setAccepted(false);
    setShowOverlay(true);
  }

  function startBreakTimer(ms) {
    clearInterval(breakTimerRef.current);
    breakTimerRef.current = setInterval(() => {
      if (!overlayActiveRef.current) triggerGoblin();
    }, ms);
  }

  useEffect(() => {
    startBreakTimer(interval);
    return () => clearInterval(breakTimerRef.current);
  }, [interval]);

  useEffect(() => {
    if (!showOverlay) return;
    playAlarm();
    alarmRef.current = setInterval(playAlarm, 5000);
    return () => {
      clearInterval(alarmRef.current);
      stopAlarm();
    };
  }, [showOverlay]);

  useEffect(() => {
    if (!accepted) return;
    if (secondsLeft === 0) {
      setDone(true);
      return;
    }
    const timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [accepted, secondsLeft]);

  function accept() {
    clearInterval(alarmRef.current);
    stopAlarm();
    setAccepted(true);
  }

  function dismiss() {
    const newTally = tally + 1;
    setTally(newTally);
    localStorage.setItem("breakBounceTally", newTally);
    overlayActiveRef.current = false;
    setShowOverlay(false);
    setAccepted(false);
  }

  function saveInterval(ms) {
    localStorage.setItem("breakBounceInterval", ms);
    setIntervalValue(ms);
    setShowSettings(false);
  }

  function resetTally() {
    setTally(0);
    localStorage.setItem("breakBounceTally", 0);
  }

  if (tally >= TALLY_GOAL) {
    return (
      <div className="reward-screen">
        <h1>🎉 The Goblin is Free!</h1>
        <p>
          You answered the call {TALLY_GOAL} times, mortal. The ancient debt is
          paid. The goblin grants you peace... for now.
        </p>
        <button className="appease-btn" onClick={resetTally}>
          Begin a new pact 👺
        </button>
      </div>
    );
  }

  if (showSettings) {
    return (
      <div className="settings-panel">
        <Header tally={tally} onSettings={() => setShowSettings(false)} />
        <h2>⚙️ Settings</h2>
        <p>How often should the goblin appear?</p>
        <div className="interval-options">
          {INTERVALS.map((opt) => (
            <button
              key={opt.value}
              className={`interval-btn ${interval === opt.value ? "active" : ""}`}
              onClick={() => saveInterval(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button className="appease-btn" onClick={() => setShowSettings(false)}>
          ← Back
        </button>
      </div>
    );
  }

  if (!showOverlay) {
    return (
      <div className="waiting">
        <Header tally={tally} onSettings={() => setShowSettings(true)} />
        <h2>Break Bounce 👺</h2>
        <p>
          Today's theme: <strong>{theme.name}</strong>
        </p>
        <p>
          Break every:{" "}
          <strong>{INTERVALS.find((i) => i.value === interval)?.label}</strong>
        </p>
        <p>Your goblin will arrive soon.</p>
        <button className="appease-btn" onClick={triggerGoblin}>
          I want to see the goblin now
        </button>
      </div>
    );
  }

  return (
    <div className="overlay">
      <PhysicsCanvas creatures={theme.creatures} />
      <div className="content">
        <h1 className="command">{command.title}</h1>
        <p className="subtext">{command.subtitle}</p>
        {!accepted ? (
          <button className="appease-btn" onClick={accept}>
            Okay, I accept 🔔
          </button>
        ) : !done ? (
          <div className="countdown">{secondsLeft}</div>
        ) : (
          <button className="appease-btn" onClick={dismiss}>
            I have appeased the goblin 👺
          </button>
        )}
      </div>
    </div>
  );
}

export default App;

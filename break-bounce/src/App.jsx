import { useState, useEffect, useRef } from "react";
import PhysicsCanvas from "./PhysicsCanvas";
import "./App.css";

const THEMES = {
  cats: {
    name: "Creatures of the purr",
    creatures: ["🐱", "🐈", "🐈‍⬛", "🙀", "𓃭", "🐾", "🐆", "𓃮", "🐆", "𓃠"],
  },
  spooky: {
    name: "Skulls & Spooky",
    creatures: ["💀", "👻", "🦇", "🕷️ ", "☠️ ", "🫀", "🩸", "🕸️ "],
  },
  goblins: {
    name: "Goblins",
    creatures: ["👺", "😈", "👿", "🔥", "🤬", "💢", "🧿", "⚡"],
  },
  vibes: {
    name: "Vibes",
    creatures: ["🌈", "✨", "🪩", "💫", "⭐", "🎉", "🦋", "🌀"],
  },
  cursed: {
    name: "Cursed",
    creatures: ["🤡", "👁️ ", "🦷", "🧿", "🫁", "🩸", "🕯️ ", "🪦"],
  },
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

const RAIN = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 110 - 5}%`,
  top: `${Math.random() * 100}%`,
  duration: `${0.6 + Math.random() * 0.8}s`,
  delay: `${Math.random() * 3}s`,
  opacity: 0.15 + Math.random() * 0.35,
  height: `${12 + Math.random() * 20}px`,
}));

const EMBERS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${40 + Math.random() * 60}%`,
  duration: `${2 + Math.random() * 4}s`,
  delay: `${Math.random() * 5}s`,
  size: `${1.5 + Math.random() * 2.5}px`,
  color: i % 2 === 0 ? "#4fc8e8" : "#2a7a9a",
}));

const MIST = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  duration: `${6 + Math.random() * 8}s`,
  delay: `${Math.random() * 6}s`,
  size: `${80 + Math.random() * 120}px`,
}));

function Particles() {
  return (
    <>
      {RAIN.map((p) => (
        <div
          key={`r${p.id}`}
          className="particle-rain"
          style={{
            left: p.left,
            top: p.top,
            height: p.height,
            opacity: p.opacity,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
      {EMBERS.map((p) => (
        <div
          key={`e${p.id}`}
          className="particle-ember"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 6px ${p.color}`,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
      {MIST.map((p) => (
        <div
          key={`m${p.id}`}
          className="particle-mist"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: "#0a2a4a",
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </>
  );
}

function Header({ tally, onSettings }) {
  return (
    <div className="header">
      <div className="header-title-wrap">
        <span className="header-title">⚔️ Break Bounce</span>
        <div className="header-about">
          A web app that sounds an alarm and pulls you into a "Break Bounce"
          session. <br /> Complete five sessions in a day, and the Goblin
          finally leaves you alone—rewarding you with peace and a parting photo.
        </div>
      </div>
      <div className="tally-tab">
        <span>Tally:</span>
        <div className="tally-pips">
          {Array.from({ length: TALLY_GOAL }, (_, i) => (
            <span key={i} className={`pip ${i < tally ? "filled" : ""}`}>
              ❤️
            </span>
          ))}
        </div>
        <span>
          {tally}/{TALLY_GOAL}
        </span>
      </div>
      <button className="settings-btn" onClick={onSettings}>
        🕰️
      </button>
    </div>
  );
}

function GigerBottom() {
  return (
    <div className="giger-bottom">
      <svg
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="gg" cx="50%" cy="100%" r="70%">
            <stop offset="0%" stopColor="#4fc8e8" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#4fc8e8" stopOpacity="0" />
          </radialGradient>
          <filter id="eglow">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ambient bottom glow */}
        <rect x="0" y="0" width="1440" height="220" fill="url(#gg)" />

        {/* layer 1 — far background terrain */}
        <path
          fill="#040810"
          d="M0,220 L0,148 Q80,130 160,148 Q240,166 320,142 Q400,118 480,140 Q560,162 640,138 Q720,114 800,138 Q880,162 960,138 Q1040,114 1120,138 Q1200,162 1280,142 Q1360,122 1440,142 L1440,220 Z"
        />

        {/* background vertebrae towers */}
        {[120, 340, 560, 780, 1000, 1220, 1400].map((x, i) => (
          <g key={i}>
            {[0, 1, 2, 3, 4, 5].map((j) => (
              <ellipse
                key={j}
                cx={x}
                cy={138 + j * 13}
                rx={13 - j}
                ry={4.5}
                fill="#06101e"
                stroke="#1a4a6a"
                strokeWidth="0.4"
              />
            ))}
            <line
              x1={x}
              y1={138}
              x2={x}
              y2={220}
              stroke="#020408"
              strokeWidth="4"
            />
          </g>
        ))}

        {/* layer 2 — mid ground */}
        <path
          fill="#060c17"
          d="M0,220 L0,168 Q72,158 144,170 Q216,182 288,168 Q360,154 432,168 Q504,182 576,168 Q648,154 720,168 Q792,182 864,168 Q936,154 1008,168 Q1080,182 1152,168 Q1224,154 1296,168 Q1368,182 1440,168 L1440,220 Z"
        />

        {/* cyan horizon glow line */}
        <path
          fill="none"
          stroke="#4fc8e8"
          strokeWidth="1"
          strokeOpacity="0.2"
          d="M0,168 Q72,158 144,170 Q216,182 288,168 Q360,154 432,168 Q504,182 576,168 Q648,154 720,168 Q792,182 864,168 Q936,154 1008,168 Q1080,182 1152,168 Q1224,154 1296,168 Q1368,182 1440,168"
        />

        {/* skull faces embedded in mid layer */}
        {[300, 720, 1140].map((x, i) => (
          <g key={i}>
            <ellipse
              cx={x}
              cy={162}
              rx={28}
              ry={20}
              fill="#070e1c"
              stroke="#4fc8e8"
              strokeWidth="0.7"
              strokeOpacity="0.35"
            />
            <ellipse cx={x - 9} cy={161} rx={7} ry={6} fill="#020407" />
            <ellipse cx={x + 9} cy={161} rx={7} ry={6} fill="#020407" />
            <ellipse
              cx={x - 9}
              cy={161}
              rx={3}
              ry={2.5}
              fill="#4fc8e8"
              fillOpacity="0.22"
              filter="url(#eglow)"
            />
            <ellipse
              cx={x + 9}
              cy={161}
              rx={3}
              ry={2.5}
              fill="#4fc8e8"
              fillOpacity="0.22"
              filter="url(#eglow)"
            />
            <path
              d={`M${x - 15},173 Q${x},179 ${x + 15},173`}
              fill="none"
              stroke="#4fc8e8"
              strokeWidth="0.6"
              strokeOpacity="0.3"
            />
            {[-6, -2, 2, 6].map((dx, j) => (
              <rect
                key={j}
                x={x + dx - 1.5}
                y={173}
                width={3}
                height={6}
                rx={1}
                fill="#030508"
              />
            ))}
          </g>
        ))}

        {/* layer 3 — foreground (darkest) */}
        <path
          fill="#020407"
          d="M0,220 L0,198 Q72,192 144,200 Q216,208 288,196 Q360,184 432,196 Q504,208 576,196 Q648,184 720,196 Q792,208 864,196 Q936,184 1008,196 Q1080,208 1152,196 Q1224,184 1296,196 Q1368,208 1440,196 L1440,220 Z"
        />

        {/* foreground vertebrae — most prominent, glowing caps */}
        {[60, 200, 380, 540, 700, 860, 1020, 1200, 1380].map((x, i) => (
          <g key={i}>
            {[0, 1, 2, 3].map((j) => (
              <g key={j}>
                <ellipse
                  cx={x}
                  cy={192 + j * 8}
                  rx={18 - j * 1.5}
                  ry={5.5}
                  fill="#030608"
                />
                <ellipse
                  cx={x}
                  cy={192 + j * 8}
                  rx={13 - j}
                  ry={3.5}
                  fill="#060e1c"
                  stroke="#4fc8e8"
                  strokeWidth="0.5"
                  strokeOpacity="0.55"
                />
                <ellipse
                  cx={x}
                  cy={192 + j * 8}
                  rx={5}
                  ry={1.5}
                  fill="#4fc8e8"
                  fillOpacity="0.07"
                />
              </g>
            ))}
            <rect
              x={x - 2}
              y={192}
              width={4}
              height={28}
              fill="#010203"
              rx={1}
            />
            <ellipse
              cx={x}
              cy={192}
              rx={7}
              ry={2.5}
              fill="#4fc8e8"
              fillOpacity="0.2"
              filter="url(#eglow)"
            />
          </g>
        ))}

        {/* biomechanical pipe running across base */}
        <rect x="0" y="211" width="1440" height="5" fill="#040910" />
        <rect
          x="0"
          y="212"
          width="1440"
          height="1.5"
          fill="#4fc8e8"
          fillOpacity="0.12"
        />
        {Array.from({ length: 19 }, (_, i) => (
          <rect
            key={i}
            x={i * 80 - 4}
            y={208}
            width={8}
            height={11}
            fill="#060c18"
            rx={1.5}
          />
        ))}
      </svg>
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

  const REWARD_CATS = [
    "/creatures/cat_1.png",
    "/creatures/cat_2.png",
    "/creatures/cat_3.png",
    "/creatures/cat_4.png",
    "/creatures/cat_5.png",
    "/creatures/cat_6.png",
    "/creatures/cat_7.png",
    "/creatures/cat_8.jpg",
  ];
  const [rewardCat] = useState(
    () => REWARD_CATS[Math.floor(Math.random() * REWARD_CATS.length)],
  );

  if (tally >= TALLY_GOAL) {
    return (
      <div className="reward-screen">
        <GigerBottom />
        <img src={rewardCat} className="reward-cat" alt="freed goblin" />
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
        <GigerBottom />
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
        <Particles />
        <GigerBottom />
        <Header tally={tally} onSettings={() => setShowSettings(true)} />
        <div className="zelda-box">
          <h2>Break Bounce</h2>
          <div className="zelda-divider" />
          <p>
            Today's Theme: <strong>{theme.name}</strong>
          </p>
          <p>
            Break Every:{" "}
            <strong>
              {INTERVALS.find((i) => i.value === interval)?.label}
            </strong>
          </p>
          <div className="zelda-divider" />
          <p>A goblin approaches...</p>
          <br />
          <button className="appease-btn" onClick={triggerGoblin}>
            ⚔️ Summon the Goblin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay">
      <Particles />
      <GigerBottom />
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

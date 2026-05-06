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
  space: {
    name: "Cosmic Void",
    creatures: ["🚀", "👾", "🛸", "🌌", "🪐", "☄️", "👽", "🌠", "🔭", "🌑", "💫", "🛰️"],
  },
  ocean: {
    name: "The Deep",
    creatures: ["🦑", "🐙", "🦈", "🌊", "🐋", "🐠", "🦀", "🐚", "🪸", "🐡", "🦞", "🫧"],
  },
  dragons: {
    name: "Dragon's Lair",
    creatures: ["🐉", "🔥", "⚔️", "🛡️", "💎", "🏰", "🧙", "🌋", "🗡️", "🦎", "🪄", "🌪️"],
  },
  infernal: {
    name: "The Infernal",
    creatures: ["👹", "🔱", "🌋", "🩸", "🌑", "🕯️", "🦴", "🪦", "🌀", "⚡", "🔥", "👁️"],
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

function getSavedThemeKey() {
  const saved = localStorage.getItem("breakBounceThemeKey");
  return saved && THEMES[saved] ? saved : "cats";
}

function getSavedInterval() {
  const saved = localStorage.getItem("breakBounceInterval");
  return saved ? parseInt(saved) : 60 * 60 * 1000;
}

function getSavedTally() {
  const saved = localStorage.getItem("breakBounceTally");
  return saved ? parseInt(saved) : 0;
}

function getSavedStreak() {
  const saved = localStorage.getItem("breakBounceStreak");
  return saved ? JSON.parse(saved) : { count: 0, lastCompleteDate: null };
}

function getSavedHistory() {
  const saved = localStorage.getItem("breakBounceHistory");
  return saved ? JSON.parse(saved) : [];
}

function computeNewStreak(current) {
  const today = new Date().toDateString();
  if (current.lastCompleteDate === today) return current;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const newCount = current.lastCompleteDate === yesterday.toDateString() ? current.count + 1 : 1;
  return { count: newCount, lastCompleteDate: today };
}

function groupByDate(history) {
  const map = {};
  history.forEach((e) => {
    if (!map[e.date]) map[e.date] = [];
    map[e.date].push(e);
  });
  return Object.entries(map).map(([date, entries]) => ({ date, entries }));
}

const COMMANDS = [
  { title: "Stand up, mortal!", subtitle: "Touch your toes for 30 seconds." },
  {
    title: "The goblin demands movement.",
    subtitle: "Do 10 squats. Now.",
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
    subtitle: "Stand up and roll your shoulders 5 times. Both directions.",
  },
  {
    title: "You have been sitting too long.",
    subtitle: "March in place for 30 seconds.",
  },

  {
    title: "The goblin is watching.",
    subtitle: "Stand up and spin in a slow circle.",
  },
  {
    title: "Break the curse.",
    subtitle: "Do 10 hamstring stretches on each leg. No excuses.",
  },
  {
    title: "Your spine begs for mercy.",
    subtitle: "Stretch side to side for 30 seconds.",
  },
  {
    title: "Move, or else.",
    subtitle: "Do 15 seconds of high knees.",
  },
  {
    title: "The void grows impatient.",
    subtitle: "Shake out your arms and legs.",
  },
  {
    title: "You are becoming furniture.",
    subtitle: "Stand up and walk around for 1 minute. Go. Go. Go.",
  },
  {
    title: "Interrupting your stagnation.",
    subtitle: "Touch your toes 5 times.",
  },
  {
    title: "The goblin insists.",
    subtitle: "Do 10 lunges (5 each leg).",
  },
  {
    title: "Your body remembers movement.",
    subtitle: "Reach for the ceiling and hold for 20 seconds.",
  },
  {
    title: "Stillness is not an option.",
    subtitle: "Jog in place for 30 seconds.",
  },
  {
    title: "You’ve been claimed by the chair.",
    subtitle: "Stand up and twist your torso left and right.",
  },
  {
    title: "The ritual continues.",
    subtitle: "Do 10 arm circles forward and backward.",
  },
  {
    title: "The goblin grows restless.",
    subtitle: "Pace around the room for 1 minute.",
  },
  {
    title: "You cannot ignore this.",
    subtitle: "Do 10 calf raises.",
  },
  {
    title: "Freedom requires motion.",
    subtitle: "Stretch your neck gently side to side.",
  },
];

const SHAME_MESSAGES = [
  { title: "COWARD.", subtitle: "The goblin has recorded your weakness in the ancient ledger. It will not forget." },
  { title: "Pathetic.", subtitle: "Even the chair is disappointed. The chair has more spine than you." },
  { title: "The goblin weeps.", subtitle: "Not for you. For itself. To be denied by such a feeble excuse for a mortal." },
  { title: "Noted.", subtitle: "Your name has been added to the Wall of Shame. It is a very long wall. You fit right in." },
  { title: "I see.", subtitle: "I see exactly who you are. The goblin also sees. We all see. Goodbye." },
  { title: "Fine.", subtitle: "Just sit there. Become one with the chair. Let it consume you slowly. This is what you chose." },
  { title: "The ancient law is broken.", subtitle: "Somewhere, a goblin is crying. Are you proud of yourself? Think about it." },
  { title: "A true goblin never forgets.", subtitle: "Your cowardice has been documented. In ink. Made of shame. Signed by you." },
  { title: "Incredible. Truly.", subtitle: "In all my years haunting desk workers, I have never seen such a spectacular refusal to try." },
  { title: "The prophecy was wrong.", subtitle: "It said a champion would rise. It did not account for you specifically." },
];

let currentCtx = null;

async function playAlarm(muted) {
  if (muted) return;
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

function playDismissSound(muted) {
  if (muted) return;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = "sine";
    const start = ctx.currentTime + i * 0.12;
    gain.gain.setValueAtTime(0.25, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
    osc.start(start);
    osc.stop(start + 0.5);
  });
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

function Header({ tally, onSettings, onHistory, muted, onMute, onLogoClick, onRules }) {
  return (
    <div className="header">
      <div className="header-title-wrap">
        <span className="header-title" onClick={onLogoClick}>⚔️ Break Bounce</span>
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
      <div className="header-btns">
        <button className="settings-btn" onClick={onMute} title={muted ? "Unmute" : "Mute"}>{muted ? "🔇" : "🔊"}</button>
        <button className="settings-btn" onClick={onRules} title="The Pact — Rules">📖</button>
        <button className="settings-btn" onClick={onHistory}>📜</button>
        <button className="settings-btn" onClick={onSettings}>🕰️</button>
      </div>
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

const SPLASH_TEXT = "Pssst. Yeah, you. The one glued to the chair. I am Break Bounce. A sassy goblin who will remind you to take breaks. Complete 5 sessions and I shall leave you in peace...for today.";

let _splashSeen = false;

function SplashScreen({ onEnter }) {
  const [choice, setChoice] = useState(null); // null | "new" | "familiar"
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (choice !== "new") return;
    let i = 0;
    const timer = setInterval(() => {
      if (i < SPLASH_TEXT.length) {
        setDisplayed(SPLASH_TEXT.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(timer);
      }
    }, 38);
    return () => clearInterval(timer);
  }, [choice]);

  useEffect(() => {
    if (choice === "familiar") onEnter();
  }, [choice]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const CELL = 44;
    const cols = Math.ceil(canvas.width / CELL) + 1;
    const rows = Math.ceil(canvas.height / CELL) + 1;
    ctx.fillStyle = "#03050d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * CELL;
        const y = r * CELL;
        ctx.fillStyle = r % 2 === c % 2 ? "#040a12" : "#03070f";
        ctx.fillRect(x, y, CELL, CELL);
        ctx.strokeStyle = "#1a4a6a55";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, CELL, CELL);
        if (Math.random() > 0.65) {
          ctx.strokeStyle = "#1a4a6a99";
          ctx.lineWidth = 2;
          const side = Math.floor(Math.random() * 4);
          ctx.beginPath();
          if (side === 0) { ctx.moveTo(x, y); ctx.lineTo(x + CELL, y); }
          else if (side === 1) { ctx.moveTo(x + CELL, y); ctx.lineTo(x + CELL, y + CELL); }
          else if (side === 2) { ctx.moveTo(x, y + CELL); ctx.lineTo(x + CELL, y + CELL); }
          else { ctx.moveTo(x, y); ctx.lineTo(x, y + CELL); }
          ctx.stroke();
        }
      }
    }
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, 60);
      grad.addColorStop(0, "#4fc8e814");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(x - 60, y - 60, 120, 120);
    }
  }, []);

  return (
    <div className="splash-screen">
      <canvas ref={canvasRef} className="splash-canvas" />
      <div className="splash-content">
        {choice === null ? (
          <>
            <div className="splash-choose-prompt">
              <p className="splash-welcome-title">Welcome to Break Bounce</p>
              <p className="splash-who-title">Who Approaches the Pact?</p>
            </div>
            <div className="splash-cat-choice">
              <button className="splash-cat-option" onClick={() => setChoice("new")}>
                <img src="/creatures/cat04.png" className="splash-cat" alt="Fresh Prey" />
                <span className="splash-cat-label">Fresh Prey</span>
                <span className="splash-cat-sublabel">First time here</span>
              </button>
              <button className="splash-cat-option" onClick={() => setChoice("familiar")}>
                <img src="/creatures/cat03.png" className="splash-cat" alt="Veteran of the Chair" />
                <span className="splash-cat-label">Veteran of the Chair</span>
                <span className="splash-cat-sublabel">I know the rules</span>
              </button>
            </div>
            <p className="splash-tab-note">⚔️ Keep this tab open while you work — the goblin needs to watch you.</p>
          </>
        ) : choice === "new" ? (
          <>
            <div className="splash-bubble-wrap">
              <div className="splash-speech-bubble">
                <p className="splash-text">
                  {displayed}
                  <span className={`splash-cursor${done ? " blink" : ""}`}>▌</span>
                </p>
              </div>
            </div>
            <div className="splash-cat-wrap">
              <img src="/creatures/cat04.png" className="splash-cat" alt="Break Bounce mascot" />
            </div>
            {done && (
              <div className="splash-enter-wrap">
                <button className="appease-btn" onClick={onEnter}>
                  I accept the pact ⚔️
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="app-footer">
      Created by Anngie & Claude ✦
    </div>
  );
}


function App() {
  const [showSplash, setShowSplash] = useState(!_splashSeen);

  const [showRules, setShowRules] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [done, setDone] = useState(false);
  const [shamed, setShamed] = useState(false);
  const [shameMsg, setShameMsg] = useState(null);
  const [command, setCommand] = useState(COMMANDS[0]);
  const [themeKey, setThemeKey] = useState(() => getSavedThemeKey());
  const theme = THEMES[themeKey];
  const [interval, setIntervalValue] = useState(() => getSavedInterval());
  const [tally, setTally] = useState(() => getSavedTally());
  const [streak, setStreak] = useState(() => getSavedStreak());
  const [history, setHistory] = useState(() => getSavedHistory());
  const [muted, setMuted] = useState(() => localStorage.getItem("breakBounceMuted") === "true");
  const [paused, setPaused] = useState(false);
  const mutedRef = useRef(muted);
  const alarmRef = useRef(null);
  const overlayActiveRef = useRef(false);
  const breakTimerRef = useRef(null);

  const REWARD_CATS = [
    "/creatures/cat01.png",
    "/creatures/cat02.png",
    "/creatures/cat03.png",
    "/creatures/cat04.png",
    "/creatures/cat05.png",
    "/creatures/cat06.png",
    "/creatures/cat07.png",
  ];
  const [rewardCat] = useState(
    () => REWARD_CATS[Math.floor(Math.random() * REWARD_CATS.length)],
  );

  function toggleMute() {
    const newMuted = !muted;
    setMuted(newMuted);
    mutedRef.current = newMuted;
    localStorage.setItem("breakBounceMuted", newMuted);
    if (newMuted) stopAlarm();
  }

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
    playAlarm(mutedRef.current);
    alarmRef.current = setInterval(() => playAlarm(mutedRef.current), 5000);
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
    playDismissSound(mutedRef.current);
    const newTally = tally + 1;

    const entry = {
      date: new Date().toDateString(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      title: command.title,
    };
    const newHistory = [entry, ...history].slice(0, 100);
    setHistory(newHistory);
    localStorage.setItem("breakBounceHistory", JSON.stringify(newHistory));

    if (newTally >= TALLY_GOAL) {
      const newStreak = computeNewStreak(streak);
      setStreak(newStreak);
      localStorage.setItem("breakBounceStreak", JSON.stringify(newStreak));
    }

    setTally(newTally);
    localStorage.setItem("breakBounceTally", newTally);
    overlayActiveRef.current = false;
    setShowOverlay(false);
    setAccepted(false);
  }

  function skip() {
    clearInterval(alarmRef.current);
    stopAlarm();
    const msg = SHAME_MESSAGES[Math.floor(Math.random() * SHAME_MESSAGES.length)];
    setShameMsg(msg);
    setShamed(true);
  }

  function dismissShame() {
    overlayActiveRef.current = false;
    setShowOverlay(false);
    setAccepted(false);
    setShamed(false);
    setShameMsg(null);
    clearInterval(breakTimerRef.current);
    setPaused(true);
  }

  function saveInterval(ms) {
    localStorage.setItem("breakBounceInterval", ms);
    setIntervalValue(ms);
    setShowSettings(false);
  }

  function saveTheme(key) {
    localStorage.setItem("breakBounceThemeKey", key);
    setThemeKey(key);
    if (paused) {
      setPaused(false);
      startBreakTimer(interval);
    }
  }

  function resetTally() {
    setTally(0);
    localStorage.setItem("breakBounceTally", 0);
  }

  function goToSplash() {
    _splashSeen = false;
    setShowSplash(true);
  }

  function enterApp() {
    _splashSeen = true;
    setShowSplash(false);
  }

  if (showSplash) return <SplashScreen onEnter={enterApp} />;

  if (tally >= TALLY_GOAL) {
    return (
      <div className="reward-screen">
        <GigerBottom />
        <div className="reward-cat-wrap">
          <img src={rewardCat} className="reward-cat" alt="freed goblin" />
        </div>
        <h1>🎉 The Goblin is Free!</h1>
        <p>
          You answered the call {TALLY_GOAL} times, mortal. The ancient debt is
          paid. The goblin grants you peace... for now.
        </p>
        <button className="appease-btn" onClick={resetTally}>
          Begin a new pact 👺
        </button>
        <Footer />
      </div>
    );
  }

  if (showSettings) {
    return (
      <div className="settings-panel">
        <GigerBottom />
        <Header tally={tally} onSettings={() => setShowSettings(false)} onHistory={() => { setShowSettings(false); setShowHistory(true); }} muted={muted} onMute={toggleMute} onLogoClick={goToSplash} onRules={() => { setShowSettings(false); setShowRules(true); }} />
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
        <Footer />
      </div>
    );
  }

  if (showHistory) {
    const grouped = groupByDate(history);
    return (
      <div className="settings-panel">
        <GigerBottom />
        <Header tally={tally} onSettings={() => { setShowHistory(false); setShowSettings(true); }} onHistory={() => setShowHistory(false)} muted={muted} onMute={toggleMute} onLogoClick={goToSplash} onRules={() => { setShowHistory(false); setShowRules(true); }} />
        <h2>📜 The Chronicle</h2>
        {streak.count > 0 && (
          <p className="streak-display">🔥 {streak.count} day streak</p>
        )}
        <div className="history-log">
          {grouped.length === 0 ? (
            <p className="history-empty">No sessions completed yet. The goblin waits.</p>
          ) : (
            grouped.map(({ date, entries }) => (
              <div key={date} className="history-day">
                <h3 className="history-date">{date}</h3>
                {entries.map((e, i) => (
                  <div key={i} className="history-entry">
                    <span className="history-time">{e.time}</span>
                    <span className="history-title">{e.title}</span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
        <button className="appease-btn" onClick={() => setShowHistory(false)}>← Back</button>
        <Footer />
      </div>
    );
  }

  if (showRules) {
    return (
      <div className="settings-panel">
        <GigerBottom />
        <Header tally={tally} onSettings={() => { setShowRules(false); setShowSettings(true); }} onHistory={() => { setShowRules(false); setShowHistory(true); }} muted={muted} onMute={toggleMute} onLogoClick={goToSplash} onRules={() => setShowRules(false)} />
        <h2>📖 The Pact</h2>
        <div className="rules-list">
          <div className="rules-item">
            <span className="rules-icon">⏰</span>
            <p>The goblin appears at your chosen interval — 15, 30, 45, or 60 minutes.</p>
          </div>
          <div className="rules-item">
            <span className="rules-icon">⚔️</span>
            <p>When summoned, accept the challenge and complete a 30-second movement break.</p>
          </div>
          <div className="rules-item">
            <span className="rules-icon">❤️</span>
            <p>Complete 5 sessions in a day to satisfy the goblin and earn your peace.</p>
          </div>
          <div className="rules-item">
            <span className="rules-icon">🏳️</span>
            <p>You may skip — but the goblin remembers. Shame awaits the weak.</p>
          </div>
          <div className="rules-item">
            <span className="rules-icon">🖥️</span>
            <p>Keep this tab open while you work. The timer runs in the background and will not fire if the tab is closed.</p>
          </div>
        </div>
        <button className="appease-btn" onClick={() => setShowRules(false)}>← Back</button>
        <Footer />
      </div>
    );
  }

  if (!showOverlay) {
    return (
      <div className="waiting">
        <Particles />
        <GigerBottom />
        <Header tally={tally} onSettings={() => setShowSettings(true)} onHistory={() => setShowHistory(true)} muted={muted} onMute={toggleMute} onLogoClick={goToSplash} onRules={() => setShowRules(true)} />
        <div className="zelda-box">
          <h2>Break Bounce</h2>
          {streak.count > 0 && (
            <p className="streak-display">🔥 {streak.count} day streak</p>
          )}
          <div className="zelda-divider" />
          <p>Choose your theme{paused ? ":" : ":"}</p>
          {paused && (
            <p className="resume-nudge">👺 The goblin waits. Select any theme to resume.</p>
          )}
          <div className={`theme-options${paused ? " theme-options-nudge" : ""}`}>
            {Object.entries(THEMES).map(([key, t]) => (
              <button
                key={key}
                className={`theme-btn ${themeKey === key ? "active" : ""}`}
                onClick={() => saveTheme(key)}
              >
                <span className="theme-btn-emojis">
                  {t.creatures.slice(0, 3).join(" ")}
                </span>
                <span className="theme-btn-name">{t.name}</span>
              </button>
            ))}
          </div>
          <div className="zelda-divider" />
          <p>
            Break Every:{" "}
            <strong>
              {INTERVALS.find((i) => i.value === interval)?.label}
            </strong>
            <span className="break-info-tip">
                ⓘ
                <span className="break-info-popup">You can change your time interval in clock settings at the top right.</span>
              </span>
          </p>
          <div className="zelda-divider" />
          <p>A goblin approaches...</p>
          <br />
          <button className="appease-btn" onClick={triggerGoblin}>
            ⚔️ Summon the Goblin
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`overlay${shamed ? " shame-overlay" : ""}`}>
      <Particles />
      <GigerBottom />
      <PhysicsCanvas creatures={theme.creatures} />
      {!shamed && <p className="session-progress">🚩 Session {tally + 1} of {TALLY_GOAL} 🚩</p>}
      <div className="content">
        {shamed ? (
          <>
            <div className="command-scroll shame-scroll">
              <span className="scroll-corner-tl" />
              <span className="scroll-corner-tr" />
              <span className="scroll-corner-bl" />
              <span className="scroll-corner-br" />
              <h1 className="command shame-command">{shameMsg.title}</h1>
              <p className="subtext">{shameMsg.subtitle}</p>
            </div>
            <button className="appease-btn shame-btn" onClick={dismissShame}>
              I accept my shame 🙇
            </button>
          </>
        ) : (
          <>
            <div className="command-scroll">
              <span className="scroll-corner-tl" />
              <span className="scroll-corner-tr" />
              <span className="scroll-corner-bl" />
              <span className="scroll-corner-br" />
              <h1 className="command">{command.title}</h1>
              <p className="subtext">{command.subtitle}</p>
            </div>
            {!accepted ? (
              <div className="overlay-actions">
                <button className="appease-btn" onClick={accept}>
                  Okay, I accept 🔔
                </button>
                <button className="skip-btn" onClick={skip}>
                  I cannot accept 🏳️
                </button>
              </div>
            ) : !done ? (
              <div className={`countdown${secondsLeft <= 5 ? " critical" : secondsLeft <= 10 ? " low" : ""}`}>{secondsLeft}</div>
            ) : (
              <button className="appease-btn" onClick={dismiss}>
                I have appeased the goblin 👺
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;

import { useState, useEffect, useRef } from "react";
import PhysicsCanvas from "./PhysicsCanvas";
import "./App.css";

const THEMES = {
  cats: {
    name: "Shadow Paws",
    creatures: ["🐱", "🐈", "🐈‍⬛", "🙀", "𓃭", "🐾", "🐆", "𓃮", "🐆", "𓃠"],
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

const THEME_COLORS = {
  cats:     '#4fc8e8',
  cursed:   '#9b1fcc',
  space:    '#7c6ae8',
  ocean:    '#2ab5c0',
  dragons:  '#e87c2a',
  infernal: '#cc2222',
};

const THEME_CATS = {
  cats:     { img: '/creatures/cat04.png', anim: 'cat-anim--squat' },
  cursed:   { img: '/creatures/cat07.png', anim: 'cat-anim--sway' },
  space:    { img: '/creatures/cat02.png', anim: 'cat-anim--float' },
  ocean:    { img: '/creatures/cat05.png', anim: 'cat-anim--swim' },
  dragons:  { img: '/creatures/cat01.png', anim: 'cat-anim--strike' },
  infernal: { img: '/creatures/cat06.png', anim: 'cat-anim--pulse' },
};

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

function formatTimeLeft(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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
  { title: "Stand up, mortal!", subtitle: "Touch your toes for 60 seconds." },
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
    subtitle: "March in place for 60 seconds.",
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
    subtitle: "Stretch side to side for 60 seconds.",
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
    subtitle: "Jog in place for 60 seconds.",
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

function playDungeonPing(muted) {
  if (muted) return;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(180, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 1.2);
  gain.gain.setValueAtTime(0.35, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 1.4);
}

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

function BrokenChairs() {
  return (
    <div className="broken-chairs">
      <svg viewBox="0 0 1440 220" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bcGlow" cx="50%" cy="100%" r="70%">
            <stop offset="0%" stopColor="#4fc8e8" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#4fc8e8" stopOpacity="0" />
          </radialGradient>
          <filter id="bcMetal">
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="bcCrack">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect x="0" y="0" width="1440" height="220" fill="url(#bcGlow)" />

        {/* layer 1 — far background terrain */}
        <path fill="#040810"
          d="M0,220 L0,148 Q80,130 160,148 Q240,166 320,142 Q400,118 480,140 Q560,162 640,138 Q720,114 800,138 Q880,162 960,138 Q1040,114 1120,138 Q1200,162 1280,142 Q1360,122 1440,142 L1440,220 Z" />

        {/* background chairs — buried, only tops visible */}
        <g transform="translate(120, 142) rotate(-20)">
          <rect x="-6" y="-48" width="13" height="30" rx="1.5" fill="#050918" stroke="#4fc8e8" strokeWidth="0.6" strokeOpacity="0.4" />
          <line x1="2" y1="-46" x2="-3" y2="-24" stroke="#cc2222" strokeWidth="0.7" strokeOpacity="0.55" filter="url(#bcCrack)" />
          <rect x="-15" y="-18" width="30" height="9" rx="2" fill="#060b1a" stroke="#4fc8e8" strokeWidth="0.5" strokeOpacity="0.3" />
        </g>
        <g transform="translate(560, 140) rotate(82)">
          <rect x="-5" y="-46" width="12" height="30" rx="1.5" fill="#050918" stroke="#4fc8e8" strokeWidth="0.6" strokeOpacity="0.35" />
          <rect x="-14" y="-16" width="28" height="9" rx="2" fill="#060b1a" stroke="#4fc8e8" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="-2.5" y="-7" width="5" height="12" fill="#040810" stroke="#1a4a6a" strokeWidth="0.4" />
        </g>
        <g transform="translate(1050, 138) rotate(15)">
          <rect x="-6" y="-50" width="13" height="32" rx="1.5" fill="#050918" stroke="#4fc8e8" strokeWidth="0.6" strokeOpacity="0.4" />
          <rect x="-15" y="-18" width="30" height="9" rx="2" fill="#060b1a" stroke="#4fc8e8" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="-15" y1="-14" x2="-5" y2="-18" stroke="#cc2222" strokeWidth="0.8" strokeOpacity="0.6" filter="url(#bcCrack)" />
        </g>

        {/* layer 2 — mid ground */}
        <path fill="#060c17"
          d="M0,220 L0,168 Q72,158 144,170 Q216,182 288,168 Q360,154 432,168 Q504,182 576,168 Q648,154 720,168 Q792,182 864,168 Q936,154 1008,168 Q1080,182 1152,168 Q1224,154 1296,168 Q1368,182 1440,168 L1440,220 Z" />
        <path fill="none" stroke="#4fc8e8" strokeWidth="1" strokeOpacity="0.18"
          d="M0,168 Q72,158 144,170 Q216,182 288,168 Q360,154 432,168 Q504,182 576,168 Q648,154 720,168 Q792,182 864,168 Q936,154 1008,168 Q1080,182 1152,168 Q1224,154 1296,168 Q1368,182 1440,168" />

        {/* mid-ground chairs */}
        <g transform="translate(250, 168) rotate(-28)">
          <rect x="-6" y="-45" width="13" height="28" rx="1.5" fill="#060b1c" stroke="#4fc8e8" strokeWidth="0.7" strokeOpacity="0.45" />
          <line x1="-4" y1="-43" x2="3" y2="-22" stroke="#cc2222" strokeWidth="0.9" strokeOpacity="0.65" filter="url(#bcCrack)" />
          <rect x="-16" y="-17" width="32" height="9" rx="2" fill="#070d1e" stroke="#4fc8e8" strokeWidth="0.5" strokeOpacity="0.4" />
          <rect x="-2.5" y="-8" width="5" height="10" fill="#050918" stroke="#1a4a6a" strokeWidth="0.4" />
        </g>
        <g transform="translate(720, 162) rotate(8)">
          <rect x="-6" y="-50" width="13" height="32" rx="1.5" fill="#060b1c" stroke="#4fc8e8" strokeWidth="0.7" strokeOpacity="0.5" filter="url(#bcMetal)" />
          <line x1="1" y1="-48" x2="-4" y2="-28" stroke="#cc2222" strokeWidth="1" strokeOpacity="0.7" filter="url(#bcCrack)" />
          <line x1="-6" y1="-30" x2="-20" y2="-38" stroke="#1a4a6a" strokeWidth="1.2" strokeOpacity="0.6" />
          <line x1="7" y1="-30" x2="20" y2="-35" stroke="#1a4a6a" strokeWidth="1.2" strokeOpacity="0.5" />
          <rect x="-17" y="-18" width="34" height="9" rx="2" fill="#070d1e" stroke="#4fc8e8" strokeWidth="0.6" strokeOpacity="0.4" />
          <rect x="-3" y="-9" width="6" height="12" fill="#050918" stroke="#1a4a6a" strokeWidth="0.4" />
          <line x1="-15" y1="3" x2="15" y2="3" stroke="#1a4a6a" strokeWidth="1.5" strokeOpacity="0.5" />
        </g>
        <g transform="translate(1180, 166) rotate(-82)">
          <rect x="-6" y="-48" width="13" height="30" rx="1.5" fill="#060b1c" stroke="#4fc8e8" strokeWidth="0.7" strokeOpacity="0.4" />
          <rect x="-16" y="-18" width="32" height="9" rx="2" fill="#070d1e" stroke="#4fc8e8" strokeWidth="0.5" strokeOpacity="0.35" />
          <rect x="-3" y="-9" width="6" height="12" fill="#050918" />
          <line x1="-14" y1="4" x2="14" y2="4" stroke="#1a4a6a" strokeWidth="1.5" strokeOpacity="0.4" />
          <circle cx="-14" cy="6" r="2.5" fill="#040a14" stroke="#1a4a6a" strokeWidth="0.4" />
          <circle cx="14" cy="6" r="2.5" fill="#040a14" stroke="#1a4a6a" strokeWidth="0.4" />
        </g>

        {/* layer 3 — foreground (darkest) */}
        <path fill="#020407"
          d="M0,220 L0,198 Q72,192 144,200 Q216,208 288,196 Q360,184 432,196 Q504,208 576,196 Q648,184 720,196 Q792,208 864,196 Q936,184 1008,196 Q1080,208 1152,196 Q1224,184 1296,196 Q1368,208 1440,196 L1440,220 Z" />

        {/* foreground chairs — most prominent */}
        <g transform="translate(80, 196) rotate(88)">
          <rect x="-6" y="-52" width="14" height="34" rx="2" fill="#06091a" stroke="#4fc8e8" strokeWidth="0.8" strokeOpacity="0.55" filter="url(#bcMetal)" />
          <line x1="2" y1="-50" x2="-5" y2="-28" stroke="#cc2222" strokeWidth="1.2" strokeOpacity="0.75" filter="url(#bcCrack)" />
          <rect x="-18" y="-18" width="36" height="11" rx="2" fill="#070c1e" stroke="#4fc8e8" strokeWidth="0.7" strokeOpacity="0.5" />
          <rect x="-3" y="-7" width="6" height="14" fill="#050918" stroke="#1a4a6a" strokeWidth="0.5" />
          <line x1="-18" y1="7" x2="18" y2="7" stroke="#1a4a6a" strokeWidth="2" strokeOpacity="0.5" />
          <circle cx="-18" cy="9" r="3" fill="#040a14" stroke="#4fc8e8" strokeWidth="0.5" strokeOpacity="0.4" />
          <circle cx="18" cy="9" r="3" fill="#040a14" stroke="#4fc8e8" strokeWidth="0.5" strokeOpacity="0.4" />
          <circle cx="0" cy="9" r="3" fill="#040a14" stroke="#4fc8e8" strokeWidth="0.5" strokeOpacity="0.35" />
        </g>
        <g transform="translate(400, 193) rotate(-32)">
          <rect x="-6" y="-55" width="13" height="22" rx="2" fill="#06091a" stroke="#4fc8e8" strokeWidth="0.8" strokeOpacity="0.5" filter="url(#bcMetal)" />
          <g transform="rotate(-20, 0, -26)">
            <rect x="-5" y="-34" width="12" height="16" rx="1" fill="#06091a" stroke="#cc2222" strokeWidth="0.8" strokeOpacity="0.7" filter="url(#bcCrack)" />
          </g>
          <rect x="-18" y="-20" width="36" height="11" rx="2" fill="#070c1e" stroke="#4fc8e8" strokeWidth="0.7" strokeOpacity="0.5" />
          <line x1="-18" y1="-20" x2="-24" y2="-36" stroke="#1a4a6a" strokeWidth="1.5" strokeOpacity="0.6" />
          <rect x="-3.5" y="-9" width="7" height="14" fill="#050918" stroke="#1a4a6a" strokeWidth="0.5" />
          <line x1="-18" y1="5" x2="18" y2="5" stroke="#1a4a6a" strokeWidth="2" strokeOpacity="0.5" />
          <circle cx="-18" cy="8" r="3" fill="#040a14" stroke="#4fc8e8" strokeWidth="0.5" strokeOpacity="0.45" />
          <circle cx="18" cy="8" r="3" fill="#040a14" stroke="#4fc8e8" strokeWidth="0.5" strokeOpacity="0.45" />
          <circle cx="0" cy="8" r="3" fill="#040a14" stroke="#4fc8e8" strokeWidth="0.5" strokeOpacity="0.4" />
        </g>
        <g transform="translate(780, 190) rotate(5)">
          <rect x="-7" y="-58" width="15" height="38" rx="2" fill="#06091a" stroke="#4fc8e8" strokeWidth="1" strokeOpacity="0.6" filter="url(#bcMetal)" />
          <line x1="3" y1="-56" x2="-6" y2="-28" stroke="#cc2222" strokeWidth="1.5" strokeOpacity="0.8" filter="url(#bcCrack)" />
          <line x1="-5" y1="-40" x2="2" y2="-32" stroke="#cc2222" strokeWidth="0.8" strokeOpacity="0.5" filter="url(#bcCrack)" />
          <line x1="-7" y1="-35" x2="-22" y2="-42" stroke="#1a4a6a" strokeWidth="1.5" strokeOpacity="0.7" />
          <line x1="8" y1="-35" x2="22" y2="-40" stroke="#1a4a6a" strokeWidth="1.5" strokeOpacity="0.6" />
          <rect x="-20" y="-22" width="40" height="12" rx="2.5" fill="#070c1e" stroke="#4fc8e8" strokeWidth="0.8" strokeOpacity="0.55" />
          <rect x="-4" y="-10" width="8" height="16" fill="#050918" stroke="#1a4a6a" strokeWidth="0.5" />
          <line x1="-22" y1="6" x2="22" y2="6" stroke="#1a4a6a" strokeWidth="2.5" strokeOpacity="0.6" />
          <line x1="-15" y1="2" x2="-15" y2="8" stroke="#1a4a6a" strokeWidth="2" strokeOpacity="0.5" />
          <line x1="15" y1="2" x2="15" y2="8" stroke="#1a4a6a" strokeWidth="2" strokeOpacity="0.5" />
          <circle cx="-22" cy="9" r="3.5" fill="#040a14" stroke="#4fc8e8" strokeWidth="0.6" strokeOpacity="0.5" />
          <circle cx="22" cy="9" r="3.5" fill="#040a14" stroke="#4fc8e8" strokeWidth="0.6" strokeOpacity="0.5" />
          <circle cx="0" cy="9" r="3.5" fill="#040a14" stroke="#4fc8e8" strokeWidth="0.6" strokeOpacity="0.45" />
        </g>
        <g transform="translate(1100, 195) rotate(-88)">
          <rect x="-6" y="-52" width="14" height="34" rx="2" fill="#06091a" stroke="#4fc8e8" strokeWidth="0.8" strokeOpacity="0.5" filter="url(#bcMetal)" />
          <rect x="-18" y="-18" width="36" height="11" rx="2" fill="#070c1e" stroke="#4fc8e8" strokeWidth="0.7" strokeOpacity="0.45" />
          <rect x="-3" y="-7" width="6" height="14" fill="#050918" />
          <line x1="-18" y1="7" x2="18" y2="7" stroke="#1a4a6a" strokeWidth="2" strokeOpacity="0.45" />
          <circle cx="-18" cy="9.5" r="3" fill="#040a14" stroke="#4fc8e8" strokeWidth="0.5" strokeOpacity="0.4" />
          <circle cx="18" cy="9.5" r="3" fill="#040a14" stroke="#4fc8e8" strokeWidth="0.5" strokeOpacity="0.4" />
        </g>
        <g transform="translate(1380, 194) rotate(-22)">
          <rect x="-6" y="-55" width="13" height="34" rx="2" fill="#06091a" stroke="#4fc8e8" strokeWidth="0.8" strokeOpacity="0.55" filter="url(#bcMetal)" />
          <line x1="-4" y1="-53" x2="4" y2="-28" stroke="#cc2222" strokeWidth="1" strokeOpacity="0.65" filter="url(#bcCrack)" />
          <rect x="-18" y="-21" width="36" height="11" rx="2" fill="#070c1e" stroke="#4fc8e8" strokeWidth="0.7" strokeOpacity="0.5" />
          <rect x="-3.5" y="-10" width="7" height="13" fill="#050918" stroke="#1a4a6a" strokeWidth="0.4" />
          <line x1="-18" y1="3" x2="18" y2="3" stroke="#1a4a6a" strokeWidth="2" strokeOpacity="0.45" />
          <circle cx="-18" cy="6" r="3" fill="#040a14" stroke="#4fc8e8" strokeWidth="0.5" strokeOpacity="0.4" />
          <circle cx="18" cy="6" r="3" fill="#040a14" stroke="#4fc8e8" strokeWidth="0.5" strokeOpacity="0.4" />
        </g>

        <rect x="0" y="214" width="1440" height="6" fill="#040910" />
        <rect x="0" y="215" width="1440" height="1.5" fill="#4fc8e8" fillOpacity="0.10" />
      </svg>
    </div>
  );
}

const SPLASH_TEXT = "Pssst. Yeah, you. The one glued to the chair. I am Break Bounce. A sassy goblin who will remind you to take breaks. Complete 5 sessions and I shall leave you in peace...for today.";

function getSavedHasVisited() {
  return !!localStorage.getItem('breakBounceHasVisited');
}

const SPLASH_FLOATERS = ["👹","💀","👻","🔥","🐱","🌌","🦑","🐉","🕯️","👁️","⚡","🪦","🎃","🦷","🧿","🩸","🔮","🌑","🕸️","☠️"];

const INVADERS = [
  { emoji: "👾", top: "8%",  delay: 0,    speed: 7  },
  { emoji: "👾", top: "8%",  delay: 0.6,  speed: 7  },
  { emoji: "👾", top: "8%",  delay: 1.2,  speed: 7  },
  { emoji: "👾", top: "8%",  delay: 1.8,  speed: 7  },
  { emoji: "👾", top: "8%",  delay: 2.4,  speed: 7  },
  { emoji: "💀", top: "20%", delay: 1.0,  speed: 10 },
  { emoji: "💀", top: "20%", delay: 1.7,  speed: 10 },
  { emoji: "💀", top: "20%", delay: 2.4,  speed: 10 },
  { emoji: "💀", top: "20%", delay: 3.1,  speed: 10 },
  { emoji: "🦇", top: "35%", delay: 0.3,  speed: 5  },
  { emoji: "🦇", top: "35%", delay: 1.1,  speed: 5  },
  { emoji: "🦇", top: "35%", delay: 1.9,  speed: 5  },
  { emoji: "🦇", top: "35%", delay: 2.7,  speed: 5  },
  { emoji: "🦇", top: "35%", delay: 3.5,  speed: 5  },
  { emoji: "🕯️", top: "52%", delay: 2.0,  speed: 13 },
  { emoji: "🕯️", top: "52%", delay: 2.9,  speed: 13 },
  { emoji: "🕯️", top: "52%", delay: 3.8,  speed: 13 },
  { emoji: "⚔️",  top: "67%", delay: 0.8,  speed: 8  },
  { emoji: "⚔️",  top: "67%", delay: 1.6,  speed: 8  },
  { emoji: "⚔️",  top: "67%", delay: 2.4,  speed: 8  },
  { emoji: "⚔️",  top: "67%", delay: 3.2,  speed: 8  },
  { emoji: "👁️",  top: "80%", delay: 1.5,  speed: 9  },
  { emoji: "👁️",  top: "80%", delay: 2.3,  speed: 9  },
  { emoji: "👁️",  top: "80%", delay: 3.1,  speed: 9  },
];

const STARS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  top: `${(i * 3.7 + 1) % 100}%`,
  duration: `${0.3 + (i % 5) * 0.22}s`,
  delay: `${(i * 0.55) % 5}s`,
  width: `${12 + (i % 4) * 20}px`,
  opacity: 0.2 + (i % 4) * 0.12,
  color: i % 3 === 0 ? '#9b59b6' : i % 3 === 1 ? '#4fc8e8' : '#cc2222',
}));

const MIST_BLOBS = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  left: `${(i * 22 + 5) % 90}%`,
  top: `${(i * 19 + 10) % 80}%`,
  size: `${180 + (i % 3) * 80}px`,
  duration: `${10 + i * 3}s`,
  delay: `${i * 1.8}s`,
  color: i % 3 === 0 ? 'rgba(79,200,232,0.06)' : i % 3 === 1 ? 'rgba(123,47,168,0.07)' : 'rgba(204,34,34,0.05)',
}));

function SplashScreen({ onEnter }) {
  const [choice, setChoice] = useState(null);
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
    const glowColors = ["#4fc8e814", "#7b2fa810", "#cc222208"];
    for (let i = 0; i < 16; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const color = glowColors[i % glowColors.length];
      const grad = ctx.createRadialGradient(x, y, 0, x, y, 80);
      grad.addColorStop(0, color);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(x - 80, y - 80, 160, 160);
    }
  }, []);

  return (
    <div className="splash-screen">
      <canvas ref={canvasRef} className="splash-canvas" />

      <div className="splash-bg-layer" aria-hidden="true">
        {MIST_BLOBS.map((b) => (
          <div key={b.id} className="splash-mist-blob" style={{
            left: b.left, top: b.top,
            width: b.size, height: b.size,
            background: b.color,
            animationDuration: b.duration,
            animationDelay: b.delay,
          }} />
        ))}
      </div>

      <div className="splash-bg-layer" aria-hidden="true">
        {STARS.map((s) => (
          <div key={s.id} className="splash-star-streak" style={{
            top: s.top, width: s.width, opacity: s.opacity,
            background: `linear-gradient(to right, transparent, ${s.color}, transparent)`,
            animationDuration: s.duration,
            animationDelay: s.delay,
          }} />
        ))}
      </div>

      <div className="splash-bg-layer" aria-hidden="true">
        {INVADERS.map((inv, i) => (
          <span key={i} className="splash-invader" style={{
            top: inv.top,
            animationDuration: `${inv.speed}s`,
            animationDelay: `${inv.delay}s`,
          }}>
            {inv.emoji}
          </span>
        ))}
      </div>

      <div className="splash-floats" aria-hidden="true">
        {SPLASH_FLOATERS.map((e, i) => (
          <span key={i} className="splash-float-creature" style={{
            left: `${(i * 23 + 7) % 90}%`,
            top: `${(i * 17 + 5) % 85}%`,
            animationDelay: `${((i * 0.35) % 3).toFixed(2)}s`,
            animationDuration: `${(2.5 + (i % 5) * 0.6).toFixed(1)}s`,
            fontSize: `${(1 + (i % 3) * 0.35).toFixed(2)}rem`,
            opacity: 0.15 + (i % 4) * 0.06,
          }}>
            {e}
          </span>
        ))}
      </div>

      <div className="splash-scanlines" aria-hidden="true" />
      <div className="splash-vignette" aria-hidden="true" />

      <div className="splash-content">
        {choice === null ? (
          <>
            <div className="splash-title-block">
              <p className="splash-welcome-title">Welcome to Break Bounce</p>
              <p className="splash-who-title">Who Approaches?</p>
            </div>
            <div className="splash-cat-choice">
              <button className="splash-cat-option" onMouseEnter={() => playDungeonPing(false)} onClick={() => setChoice("new")}>
                <img src="/creatures/cat04.png" className="splash-cat" alt="Fresh Prey" />
                <span className="splash-cat-label">Fresh Prey</span>
                <span className="splash-cat-sublabel splash-cat-sublabel--red">First time here</span>
              </button>
              <button className="splash-cat-option" onMouseEnter={() => playDungeonPing(false)} onClick={() => setChoice("familiar")}>
                <img src="/creatures/cat03.png" className="splash-cat" alt="Veteran of the Chair" />
                <span className="splash-cat-label">Veteran of the Chair</span>
                <span className="splash-cat-sublabel splash-cat-sublabel--red">I know the rules</span>
              </button>
            </div>
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
                <button className="splash-enter-btn" onClick={onEnter}>
                  ⚔️ &nbsp;Enter the Arena&nbsp; ⚔️
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
  const [showSplash, setShowSplash] = useState(!getSavedHasVisited());

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
  const [intervalEverSet, setIntervalEverSet] = useState(() => !!localStorage.getItem("breakBounceInterval"));
  const [paused, setPaused] = useState(false);
  const [overlayPhase, setOverlayPhase] = useState('intro');
  const mutedRef = useRef(muted);
  const alarmRef = useRef(null);
  const overlayActiveRef = useRef(false);
  const breakTimerRef = useRef(null);
  const timerStartRef = useRef(Date.now());
  const [timeLeft, setTimeLeft] = useState(() => getSavedInterval());

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
    setSecondsLeft(60);
    setDone(false);
    setAccepted(false);
    setOverlayPhase('intro');
    setShowOverlay(true);
  }

  function startBreakTimer(ms) {
    clearInterval(breakTimerRef.current);
    timerStartRef.current = Date.now();
    setTimeLeft(ms);
    breakTimerRef.current = setInterval(() => {
      if (!overlayActiveRef.current) triggerGoblin();
    }, ms);
  }

  useEffect(() => {
    startBreakTimer(interval);
    return () => clearInterval(breakTimerRef.current);
  }, [interval]);

  useEffect(() => {
    const tick = setInterval(() => {
      if (!overlayActiveRef.current && !paused) {
        const elapsed = Date.now() - timerStartRef.current;
        setTimeLeft(Math.max(0, interval - elapsed));
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [interval, paused]);

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
    if (!showOverlay || overlayPhase !== 'intro') return;
    const timer = setTimeout(() => setOverlayPhase('command'), 5000);
    return () => clearTimeout(timer);
  }, [showOverlay, overlayPhase]);

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
    startBreakTimer(interval);
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
    setIntervalEverSet(true);
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
    localStorage.removeItem('breakBounceHasVisited');
    setShowSplash(true);
  }

  function enterApp() {
    localStorage.setItem('breakBounceHasVisited', 'true');
    setShowSplash(false);
  }

  if (showSplash) return <SplashScreen onEnter={enterApp} />;

  if (tally >= TALLY_GOAL) {
    return (
      <div className="reward-screen">
        <BrokenChairs />
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
        <BrokenChairs />
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
        <BrokenChairs />
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
        <BrokenChairs />
        <Header tally={tally} onSettings={() => { setShowRules(false); setShowSettings(true); }} onHistory={() => { setShowRules(false); setShowHistory(true); }} muted={muted} onMute={toggleMute} onLogoClick={goToSplash} onRules={() => setShowRules(false)} />
        <h2>📖 The Rules</h2>
        <div className="rules-list">
          <div className="rules-item">
            <span className="rules-icon">⏰</span>
            <p>The goblin appears at your chosen interval — 15, 30, 45, or 60 minutes.</p>
          </div>
          <div className="rules-item">
            <span className="rules-icon">⚔️</span>
            <p>When summoned, accept the challenge and complete a 60-second movement break.</p>
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
        <BrokenChairs />
        <Header tally={tally} onSettings={() => setShowSettings(true)} onHistory={() => setShowHistory(true)} muted={muted} onMute={toggleMute} onLogoClick={goToSplash} onRules={() => setShowRules(true)} />
        <p className="tab-reminder">⚔️ Keep this tab open while you work — the goblin needs to watch you.</p>
        <div className="zelda-box">
          <h2>Break Bounce</h2>
          {streak.count > 0 && (
            <p className="streak-display">🔥 {streak.count} day streak</p>
          )}
          <div className="zelda-divider" />
          {!intervalEverSet && <p className="onboard-step">Step 1</p>}
          <p className="choose-theme-label">Choose your theme:</p>
          {paused && (
            <p className="resume-nudge">👺 The goblin waits. Select any theme to resume.</p>
          )}
          <div className={`theme-options${paused ? " theme-options-nudge" : ""}`}>
            {Object.entries(THEMES).map(([key, t]) => (
              <button
                key={key}
                className={`theme-card ${themeKey === key ? "active" : ""}`}
                style={{ '--accent': THEME_COLORS[key] }}
                onClick={() => saveTheme(key)}
              >
                <div className="theme-card__preview">
                  <img
                    src={THEME_CATS[key].img}
                    className={`theme-card__cat ${THEME_CATS[key].anim}`}
                    alt={t.name}
                  />
                </div>
                <span className="theme-card__name">{t.name}</span>
              </button>
            ))}
          </div>
          <div className="zelda-divider" />
          {!intervalEverSet && <p className="onboard-step">Step 2</p>}
          <p className={!intervalEverSet ? "set-time-label" : ""}>
            {intervalEverSet ? "Break Every:" : "When shall I strike?"}{" "}
            <strong>
              {INTERVALS.find((i) => i.value === interval)?.label}
            </strong>
            <span className="break-info-tip">
                ⓘ
                <span className="break-info-popup">You can change your time interval in clock settings at the top right.</span>
              </span>
          </p>
          <div className="zelda-divider" />
          {intervalEverSet && (
            <>
              <p className="next-break-label">Goblin arrives in</p>
              <p className="next-break-countdown">{formatTimeLeft(timeLeft)}</p>
              <br />
            </>
          )}
          {!intervalEverSet && <p className="onboard-step">Step 3</p>}
          {!intervalEverSet ? (
            <div className="summon-row">
              <span className="summon-label">Summon the Goblin</span>
              <button className="summon-emoji-btn" onClick={triggerGoblin}>⚔️</button>
            </div>
          ) : (
            <button className="appease-btn" onClick={triggerGoblin}>
              ⚔️ Summon the Goblin
            </button>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`overlay${shamed ? " shame-overlay" : ""}`} data-theme={themeKey} style={{ '--accent': THEME_COLORS[themeKey] }}>
      <Particles />
      <BrokenChairs />
      {!shamed && <p className="session-progress">🚩 Session {tally + 1} of {TALLY_GOAL} 🚩</p>}
      <button className="overlay-mute-btn" onClick={toggleMute} title={muted ? "Unmute" : "Mute"}>
        {muted ? "🔇" : "🔊"}
      </button>
      {!shamed && overlayPhase === 'intro' ? (
        <div className="overlay-intro">
          <img
            src={THEME_CATS[themeKey].img}
            className="overlay-intro-cat"
            alt="goblin warming up"
          />
          <p className="overlay-intro-label">The goblin stirs…</p>
        </div>
      ) : (
        <div className={`content${!shamed && overlayPhase === 'command' ? ' content--slide-in' : ''}`}>
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
      )}
    </div>
  );
}

export default App;

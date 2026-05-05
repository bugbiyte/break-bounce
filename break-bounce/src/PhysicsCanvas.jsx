import { useEffect, useRef } from "react";
import Matter from "matter-js";

const COUNT = 20;
const EMOJI_SIZE = 82;
const HALF = EMOJI_SIZE / 2;

function PhysicsCanvas({ creatures }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const { Engine, Runner, Bodies, Composite } = Matter;

    const engine = Engine.create({ gravity: { y: 0 }, enableSleeping: false });
    const width = window.innerWidth;
    const height = window.innerHeight;

    const walls = [
      Bodies.rectangle(width / 2, height + 25, width, 50, { isStatic: true }),
      Bodies.rectangle(-25, height / 2, 50, height, { isStatic: true }),
      Bodies.rectangle(width + 25, height / 2, 50, height, { isStatic: true }),
      Bodies.rectangle(width / 2, -25, width, 50, { isStatic: true }),
    ];

    const bodies = Array.from({ length: COUNT }, (_, i) =>
      Bodies.circle(
        Math.random() * (width - 100) + 50,
        Math.random() * (height - 100) + 50,
        HALF,
        {
          restitution: 1,
          friction: 0,
          frictionAir: 0,
          label: creatures[i % creatures.length],
        },
      ),
    );

    Composite.add(engine.world, [...walls, ...bodies]);
    bodies.forEach((body) => {
      const vx = (Math.random() - 0.5) * 10;
      const vy = (Math.random() - 0.5) * 10;
      Matter.Body.setVelocity(body, {
        x: Math.abs(vx) < 2 ? (vx < 0 ? -2 : 2) : vx,
        y: Math.abs(vy) < 2 ? (vy < 0 ? -2 : 2) : vy,
      });
    });

    const elements = bodies.map((body) => {
      const el = document.createElement("div");
      el.textContent = body.label;
      el.style.position = "absolute";
      el.style.fontSize = EMOJI_SIZE + "px";
      el.style.userSelect = "none";
      el.style.pointerEvents = "none";
      el.style.left = body.position.x - HALF + "px";
      el.style.top = body.position.y - HALF + "px";
      containerRef.current.appendChild(el);
      return el;
    });

    const runner = Runner.create();
    Runner.run(runner, engine);

    let animationId;
    function update() {
      bodies.forEach((body, i) => {
        const { x, y } = body.velocity;
        const speed = Math.sqrt(x * x + y * y);
        if (speed < 1.5) {
          const angle = Math.random() * Math.PI * 2;
          Matter.Body.setVelocity(body, {
            x: Math.cos(angle) * 3,
            y: Math.sin(angle) * 3,
          });
        }
        const el = elements[i];
        el.style.left = body.position.x - HALF + "px";
        el.style.top = body.position.y - HALF + "px";
        el.style.transform = `rotate(${body.angle}rad)`;
      });
      animationId = requestAnimationFrame(update);
    }
    update();

    return () => {
      cancelAnimationFrame(animationId);
      Runner.stop(runner);
      Engine.clear(engine);
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

export default PhysicsCanvas;

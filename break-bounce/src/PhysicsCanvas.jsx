import { useEffect, useRef } from "react";
import Matter from "matter-js";

const COUNT = 15;

function PhysicsCanvas({ creatures }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const { Engine, Runner, Bodies, Composite, Events } = Matter;

    const engine = Engine.create({ gravity: { y: 0 } });
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
        30,
        {
          restitution: 1,
          friction: 0,
          frictionAir: 0,
          label: creatures[i % creatures.length],
        }
      )
    );

    Composite.add(engine.world, [...walls, ...bodies]);

    bodies.forEach((body) => {
      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 10,
      });
    });

    const elements = bodies.map((body) => {
      const el = document.createElement("div");
      el.textContent = body.label;
      el.style.position = "absolute";
      el.style.fontSize = "48px";
      el.style.userSelect = "none";
      el.style.pointerEvents = "none";
      containerRef.current.appendChild(el);
      return el;
    });

    const runner = Runner.create();
    Runner.run(runner, engine);

    Events.on(engine, "afterUpdate", () => {
      bodies.forEach((body, i) => {
        const el = elements[i];
        el.style.left = body.position.x - 24 + "px";
        el.style.top = body.position.y - 24 + "px";
        el.style.transform = `rotate(${body.angle}rad)`;
      });
    });

    return () => {
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

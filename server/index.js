import { WebSocketServer } from "ws";

const PORT = process.env.PORT || 3000;
const wss = new WebSocketServer({ port: PORT });

console.log("server running on port", PORT);

const players = {};

function broadcast() {
  const data = JSON.stringify({
    type: "state",
    players
  });

  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(data);
    }
  }
}

wss.on("connection", (ws) => {
  const id = Math.random().toString(36).slice(2);

  players[id] = {
    x: 200,
    y: 200,
    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    vx: 0,
    vy: 0
  };

  ws.send(JSON.stringify({ type: "init", id }));

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);

    if (data.type === "move") {
      const p = players[id];
      if (!p) return;

      p.vx = data.vx;
      p.vy = data.vy;
    }
  });

  ws.on("close", () => {
    delete players[id];
  });
});

function tick() {
  for (const id in players) {
    const p = players[id];
    p.x += p.vx;
    p.y += p.vy;

    // simple bounds
    p.x = Math.max(0, Math.min(1000, p.x));
    p.y = Math.max(0, Math.min(1000, p.y));
  }

  broadcast();
}

setInterval(tick, 1000 / 30);

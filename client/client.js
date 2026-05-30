const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const SERVER_URL =
  location.hostname === "localhost"
    ? "ws://localhost:3000"
    : "wss://scrapcars-io.onrender.com";

const ws = new WebSocket(SERVER_URL);

let myId = null;
let players = {};

const keys = {};

window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

ws.onmessage = (msg) => {
  const data = JSON.parse(msg.data);

  if (data.type === "init") {
    myId = data.id;
  }

  if (data.type === "state") {
    players = data.players;
  }
};

function sendMovement() {
  if (!myId) return;

  let vx = 0, vy = 0;

  if (keys["w"]) vy = -3;
  if (keys["s"]) vy = 3;
  if (keys["a"]) vx = -3;
  if (keys["d"]) vx = 3;

  ws.send(JSON.stringify({
    type: "move",
    vx,
    vy
  }));
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const id in players) {
    const p = players[id];

    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 30, 30);

    if (id === myId) {
      ctx.strokeStyle = "white";
      ctx.strokeRect(p.x, p.y, 30, 30);
    }
  }
}

function loop() {
  sendMovement();
  draw();
  requestAnimationFrame(loop);
}

loop();

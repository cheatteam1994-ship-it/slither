const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ws = new WebSocket('wss://slither-z48d.onrender.com'); // Cambia con l'URL di Render
let snakeId = null;
let snakes = {};
let food = {};

ws.onopen = () => {
    console.log('Connesso al server');
};

ws.onmessage = (message) => {
    const data = JSON.parse(message.data);
    snakes = data.snakes;
    food = data.food;
    snakeId = data.id;
};

let direction = {x:1, y:0};
window.addEventListener('keydown', e => {
    if(e.key === 'ArrowUp') direction = {x:0, y:-1};
    if(e.key === 'ArrowDown') direction = {x:0, y:1};
    if(e.key === 'ArrowLeft') direction = {x:-1, y:0};
    if(e.key === 'ArrowRight') direction = {x:1, y:0};
    ws.send(JSON.stringify({direction}));
});

function draw() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Draw food
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(food.x, food.y, 10, 0, Math.PI*2);
    ctx.fill();

    // Draw snakes
    for(let id in snakes) {
        let s = snakes[id];
        ctx.fillStyle = id === snakeId ? 'lime' : 'yellow';
        s.forEach(segment => {
            ctx.fillRect(segment.x-5, segment.y-5, 10, 10);
        });
    }

    requestAnimationFrame(draw);
}
draw();


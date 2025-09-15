const WebSocket = require('ws');

// Usa la porta che Render assegna
const PORT = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port: PORT });

let snakes = {};
let food = { x: Math.random() * 800, y: Math.random() * 600 };

wss.on('connection', ws => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    snakes[id] = [{ x: 400, y: 300 }];
    let direction = { x: 1, y: 0 };

    // Invia subito stato iniziale
    ws.send(JSON.stringify({ id, snakes, food }));

    ws.on('message', msg => {
        const data = JSON.parse(msg);
        if (data.direction) direction = data.direction;
    });

    const interval = setInterval(() => {
        let head = { ...snakes[id][snakes[id].length - 1] };
        head.x += direction.x * 2;
        head.y += direction.y * 2;
        snakes[id].push(head);
        if (snakes[id].length > 5) snakes[id].shift();

        let dx = head.x - food.x;
        let dy = head.y - food.y;
        if (Math.sqrt(dx * dx + dy * dy) < 15) {
            snakes[id].push({ ...head });
            food = { x: Math.random() * 800, y: Math.random() * 600 };
        }

        // Invia stato a tutti i client
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ snakes, food, id }));
            }
        });
    }, 50);

    ws.on('close', () => {
        clearInterval(interval);
        delete snakes[id];
    });
});

console.log(`WebSocket server listening on port ${PORT}`);

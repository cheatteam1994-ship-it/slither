const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

let snakes = {};
let food = {x: Math.random()*800, y: Math.random()*600};

wss.on('connection', ws => {
    const id = Date.now() + Math.random().toString(36).substr(2,5);
    snakes[id] = [{x: 400, y: 300}];
    let direction = {x:1, y:0};
    ws.send(JSON.stringify({id, snakes, food}));

    ws.on('message', msg => {
        const data = JSON.parse(msg);
        if(data.direction) direction = data.direction;
    });

    const interval = setInterval(() => {
        // Move snake
        let head = {...snakes[id][snakes[id].length-1]};
        head.x += direction.x * 2;
        head.y += direction.y * 2;
        snakes[id].push(head);
        if(snakes[id].length > 5) snakes[id].shift();

        // Eat food
        let dx = head.x - food.x;
        let dy = head.y - food.y;
        if(Math.sqrt(dx*dx+dy*dy)<15) {
            snakes[id].push({...head});
            food = {x: Math.random()*800, y: Math.random()*600};
        }

        // Send update
        wss.clients.forEach(client => {
            if(client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({snakes, food, id}));
            }
        });
    }, 50);

    ws.on('close', () => {
        clearInterval(interval);
        delete snakes[id];
    });
});

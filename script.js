const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resetBtn = document.getElementById('reset');
const pauseBtn = document.getElementById('pause');
const colorPicker = document.getElementById('colorPicker');

let width, height;
let cells = [];
let particles = [];
let paused = false;
let color = '#00ff00';

const CELL_SIZE = 10;
const PARTICLE_COUNT = 1000;

function setup() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    initCells();
    initParticles();
}

function initCells() {
    cells = [];
    for (let y = 0; y < height / CELL_SIZE; y++) {
        cells[y] = [];
        for (let x = 0; x < width / CELL_SIZE; x++) {
            cells[y][x] = Math.random() > 0.5 ? 1 : 0;
        }
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            age: 0,
            maxAge: Math.random() * 200 + 50
        });
    }
}

function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    updateCells();
    drawCells();
    updateAndDrawParticles();

    if (!paused) {
        requestAnimationFrame(draw);
    }
}

function updateCells() {
    let newCells = JSON.parse(JSON.stringify(cells));
    for (let y = 0; y < cells.length; y++) {
        for (let x = 0; x < cells[y].length; x++) {
            let neighbors = countNeighbors(x, y);
            if (cells[y][x] === 1) {
                if (neighbors < 2 || neighbors > 3) {
                    newCells[y][x] = 0;
                }
            } else {
                if (neighbors === 3) {
                    newCells[y][x] = 1;
                }
            }
        }
    }
    cells = newCells;
}

function countNeighbors(x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            let nx = (x + dx + cells[0].length) % cells[0].length;
            let ny = (y + dy + cells.length) % cells.length;
            count += cells[ny][nx];
        }
    }
    return count;
}

function drawCells() {
    ctx.fillStyle = color;
    for (let y = 0; y < cells.length; y++) {
        for (let x = 0; x < cells[y].length; x++) {
            if (cells[y][x] === 1) {
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

function updateAndDrawParticles() {
    ctx.beginPath();
    for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.age++;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        let cellX = Math.floor(p.x / CELL_SIZE);
        let cellY = Math.floor(p.y / CELL_SIZE);
        if (cells[cellY] && cells[cellY][cellX] === 1) {
            p.vx += (Math.random() - 0.5) * 0.5;
            p.vy += (Math.random() - 0.5) * 0.5;
        }

        let alpha = 1 - p.age / p.maxAge;
        ctx.fillStyle = `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${alpha})`;
        ctx.fillRect(p.x, p.y, 2, 2);

        if (p.age > p.maxAge) {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.age = 0;
        }
    }
}

function handleClick(event) {
    let x = Math.floor(event.clientX / CELL_SIZE);
    let y = Math.floor(event.clientY / CELL_SIZE);
    cells[y][x] = 1;
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: event.clientX,
            y: event.clientY,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            age: 0,
            maxAge: Math.random() * 200 + 50
        });
    }
}

resetBtn.addEventListener('click', () => {
    initCells();
    initParticles();
});

pauseBtn.addEventListener('click', () => {
    paused = !paused;
    if (!paused) draw();
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
});

colorPicker.addEventListener('input', (event) => {
    color = event.target.value;
});

canvas.addEventListener('click', handleClick);

window.addEventListener('resize', setup);

setup();
draw();
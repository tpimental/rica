const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const colors = ['#2e7d32', '#66bb6a', '#1565c0', '#ec407a', '#ffca28', '#26c6da'];
const emojis = ['🧬', '🍃', '🔬', '🐸'];
let particles = [];

function spawnBurst(count = 140) {
  for (let i = 0; i < count; i++) {
    const useEmoji = Math.random() < 0.15;
    particles.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.3,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 3,
      size: 6 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      emoji: useEmoji ? emojis[Math.floor(Math.random() * emojis.length)] : null,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      life: 0,
      maxLife: 400 + Math.random() * 200,
    });
  }
}

function tick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles = particles.filter(p => p.life < p.maxLife && p.y < canvas.height + 40);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.02;
    p.rotation += p.rotationSpeed;
    p.life++;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);

    if (p.emoji) {
      ctx.font = `${p.size * 2}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(p.emoji, 0, 0);
    } else {
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    }

    ctx.restore();
  }

  requestAnimationFrame(tick);
}

document.getElementById('confetti-btn').addEventListener('click', () => spawnBurst());

spawnBurst(200);
tick();

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
const MAX_PARTICLES = 240;
let particles = [];

function spawnBurst(count = 100) {
  // Drop the oldest particles instead of letting the array grow unbounded
  // when the button is clicked repeatedly before earlier bursts finish falling.
  const overflow = particles.length + count - MAX_PARTICLES;
  if (overflow > 0) particles.splice(0, overflow);

  for (let i = 0; i < count; i++) {
    const useEmoji = Math.random() < 0.15;
    const size = 6 + Math.random() * 8;
    particles.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.3,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 3,
      size,
      halfSize: size / 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      emoji: useEmoji ? emojis[Math.floor(Math.random() * emojis.length)] : null,
      font: useEmoji ? `${size * 2}px sans-serif` : null,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      life: 0,
      maxLife: 400 + Math.random() * 200,
    });
  }
}

function tick() {
  // Reset transform before clearing/drawing since per-particle setTransform
  // below leaves the matrix dirty from the previous frame.
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';

  // Compact the array in place (swap-write) instead of allocating a new
  // array via filter() every frame — cuts GC churn substantially.
  let writeIndex = 0;
  for (let readIndex = 0; readIndex < particles.length; readIndex++) {
    const p = particles[readIndex];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.02;
    p.rotation += p.rotationSpeed;
    p.life++;

    if (p.life >= p.maxLife || p.y >= canvas.height + 40) continue;

    const rad = (p.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    // setTransform(translate+rotate) in one call avoids the save/rotate/restore
    // stack overhead per particle, which was the main lag source with 100s of particles.
    ctx.setTransform(cos, sin, -sin, cos, p.x, p.y);

    if (p.emoji) {
      ctx.font = p.font;
      ctx.fillText(p.emoji, 0, 0);
    } else {
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.halfSize, -p.halfSize, p.size, p.size * 0.6);
    }

    particles[writeIndex++] = p;
  }
  particles.length = writeIndex;

  requestAnimationFrame(tick);
}

let soundEnabled = true;
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playFanfare() {
  if (!soundEnabled) return;
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);

    const start = now + i * 0.11;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

    osc.start(start);
    osc.stop(start + 0.45);
  });
}

const soundToggleBtn = document.getElementById('sound-toggle');
soundToggleBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundToggleBtn.textContent = soundEnabled ? '🔊' : '🔇';
  soundToggleBtn.classList.toggle('muted', !soundEnabled);
  if (soundEnabled) getAudioCtx();
});

document.getElementById('confetti-btn').addEventListener('click', () => {
  spawnBurst();
  playFanfare();
});

spawnBurst(160);
tick();

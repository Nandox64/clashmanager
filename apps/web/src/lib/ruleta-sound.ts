let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function playSpinTick() {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 800 + Math.random() * 400;
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch {}
}

export function playWinSound() {
  try {
    const ctx = getCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i % 2 === 0 ? "triangle" : "square";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.16, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.35);
    });

    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.type = "sawtooth";
    bass.frequency.value = 130.81;
    bassGain.gain.setValueAtTime(0.1, ctx.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    bass.connect(bassGain).connect(ctx.destination);
    bass.start(ctx.currentTime);

    const sparkle = ctx.createOscillator();
    const sparkleGain = ctx.createGain();
    sparkle.type = "sine";
    sparkle.frequency.setValueAtTime(1567.98, ctx.currentTime + 0.45);
    sparkle.frequency.exponentialRampToValueAtTime(3135.96, ctx.currentTime + 0.9);
    sparkleGain.gain.setValueAtTime(0.06, ctx.currentTime + 0.45);
    sparkleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    sparkle.connect(sparkleGain).connect(ctx.destination);
    sparkle.start(ctx.currentTime + 0.45);

    bass.stop(ctx.currentTime + 0.9);
    sparkle.stop(ctx.currentTime + 0.9);
  } catch {}
}

export function playCountdownBeep() {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

export function playLoseSound() {
  try {
    const ctx = getCtx();
    const notes = [392, 349.23, 311.13, 261.63, 196];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.09, ctx.currentTime + i * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.16 + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.16);
      osc.stop(ctx.currentTime + i * 0.16 + 0.4);
    });

    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = "square";
    thud.frequency.setValueAtTime(90, ctx.currentTime + 0.65);
    thud.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 1.05);
    thudGain.gain.setValueAtTime(0.08, ctx.currentTime + 0.65);
    thudGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.05);
    thud.connect(thudGain).connect(ctx.destination);
    thud.start(ctx.currentTime + 0.65);
    thud.stop(ctx.currentTime + 1.05);
  } catch {}
}

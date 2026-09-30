/**
 * A referee's whistle, synthesised in the browser — no audio file to fetch,
 * license or cache, and nothing to download before the title screen works.
 *
 * A pea whistle is a bright note near 3 kHz with a cork pea rattling in the
 * chamber, and the rattle is what makes it a whistle rather than a beep: it
 * warbles the pitch and the level about thirty times a second. So each blast
 * is a sine (plus a quiet octave) whose frequency and gain are both wobbled by
 * a ~30 Hz "pea" oscillator, with a little breath noise band-passed around the
 * note. Two blasts, the way a ref actually blows it: a short tweet, then the
 * long one.
 *
 * Browsers only let a page make sound after the visitor has pressed or tapped
 * something on it, which is exactly why the home page opens on a "press any
 * button" title screen. Call `blowWhistle()` from inside that key or tap
 * handler.
 */

/** Seconds, relative to the moment the whistle is blown. The title screen's
 *  CSS times the "TWEEET!" burst and the shake to `longAt`. */
export const WHISTLE = { shortAt: 0, shortLen: 0.15, longAt: 0.25, longLen: 0.8 };

const NOTE = 2900;
const LEVEL = 0.16;

let shared: AudioContext | null = null;

export function blowWhistle(): void {
  if (typeof window === "undefined") return;
  try {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    shared ??= new AC();
    if (shared.state === "suspended") void shared.resume();
    scheduleWhistle(shared, shared.destination, shared.currentTime + 0.02);
  } catch {
    // Sound is the garnish. The animation carries on without it.
  }
}

/** Schedules both blasts into any context — the live one, or an offline one
 *  when measuring it. */
export function scheduleWhistle(ctx: BaseAudioContext, dest: AudioNode, t0: number): void {
  const master = ctx.createGain();
  master.gain.value = LEVEL;
  master.connect(dest);
  const breath = noiseBuffer(ctx);
  blast(ctx, master, breath, t0 + WHISTLE.shortAt, WHISTLE.shortLen);
  blast(ctx, master, breath, t0 + WHISTLE.longAt, WHISTLE.longLen);
}

function noiseBuffer(ctx: BaseAudioContext): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * 1.2);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function blast(
  ctx: BaseAudioContext,
  out: AudioNode,
  breath: AudioBuffer,
  t: number,
  dur: number,
): void {
  const end = t + dur;

  // A blown note starts hard and stops clean.
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(1, t + 0.018);
  env.gain.setValueAtTime(1, end - 0.05);
  env.gain.linearRampToValueAtTime(0, end);

  // The pea. It rattles a little faster once the breath has built up.
  const pea = ctx.createOscillator();
  pea.frequency.setValueAtTime(26, t);
  pea.frequency.linearRampToValueAtTime(33, t + 0.12);

  // Level warble: a gain that swings around 0.72 by ±0.28. It sits after the
  // envelope, so when the envelope is shut the warble has nothing to wobble.
  const trill = ctx.createGain();
  trill.gain.value = 0.72;
  const trillDepth = ctx.createGain();
  trillDepth.gain.value = 0.28;
  pea.connect(trillDepth);
  trillDepth.connect(trill.gain);

  // The note, scooping up into pitch the way a blast does, and its octave.
  const voice = (mult: number, depth: number, level: number) => {
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(NOTE * mult * 0.93, t);
    osc.frequency.exponentialRampToValueAtTime(NOTE * mult, t + 0.04);
    const wobble = ctx.createGain();
    wobble.gain.value = depth;
    pea.connect(wobble);
    wobble.connect(osc.frequency);
    const g = ctx.createGain();
    g.gain.value = level;
    osc.connect(g);
    g.connect(env);
    return osc;
  };
  const tone = voice(1, 110, 1);
  const octave = voice(2, 220, 0.12);

  // Breath through the whistle's mouth.
  const air = ctx.createBufferSource();
  air.buffer = breath;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = NOTE;
  band.Q.value = 5;
  const airLevel = ctx.createGain();
  airLevel.gain.value = 0.35;
  air.connect(band);
  band.connect(airLevel);
  airLevel.connect(env);

  env.connect(trill);
  trill.connect(out);

  for (const node of [pea, tone, octave, air]) {
    node.start(t);
    node.stop(end + 0.05);
  }
}

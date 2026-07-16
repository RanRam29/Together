/* Beshiluv (בשילוב) promo scenes — drives all motion from useScene() so
   the host timeline can trim/stretch each scene and export stays exact. */
const { useScene, Easing, clamp } = window;

const PLUM = '#622d57';
const SLATE = '#8392af';
const TEAL = '#0F6E56';        // deep teal for text legibility on cream
const TEAL_SOFT = '#9dcac8';   // logo teal (fills/dots)
const CREAM = '#FBFAF7';
const INK = '#24221E';
const MUTED = '#5F5C55';
const FONT = "'Rubik', system-ui, sans-serif";

// entrance eased 0→1 over first `p` of progress
function entrance(progress, p) { return Easing.easeOutCubic(clamp(progress / p, 0, 1)); }
// holds 1, then fades to 0 over last `p` of progress (for soft cut-out)
function fadeOut(progress, start) {
  return 1 - Easing.easeInCubic(clamp((progress - start) / (1 - start), 0, 1));
}

function Fill({ children, style }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
      justifyContent: 'center', direction: 'rtl', fontFamily: FONT,
      background: CREAM, overflow: 'hidden', ...style,
    }}>{children}</div>
  );
}

/* ── Scene 1 · Opening — three figures gather ───────────────────────── */
function Opening() {
  const { progress, localTime, dur } = useScene();
  const T = entrance(progress, 0.42);
  const gone = fadeOut(progress, 0.9);
  const dots = [
    { c: PLUM, rest: [-176, -18], from: [-170, -150], size: 96, ph: 0 },
    { c: SLATE, rest: [0, -104], from: [0, -270], size: 108, ph: 1.1 },
    { c: TEAL_SOFT, rest: [176, -18], from: [170, -150], size: 96, ph: 2.2 },
  ];
  const settled = clamp((progress - 0.42) / 0.1, 0, 1);
  return (
    <Fill>
      <div style={{ position: 'relative', width: 520, height: 320 }}>
        {dots.map((d, i) => {
          const tx = d.rest[0] + d.from[0] * (1 - T);
          const floatY = Math.sin(localTime * 1.6 + d.ph) * 7 * settled;
          const ty = d.rest[1] + d.from[1] * (1 - T) + floatY;
          const s = 0.35 + 0.65 * T;
          const op = clamp(progress / 0.14, 0, 1) * gone;
          return (
            <div key={i} style={{
              position: 'absolute', left: '50%', top: '50%',
              width: d.size, height: d.size, marginLeft: -d.size / 2, marginTop: -d.size / 2,
              borderRadius: '50%', background: d.c,
              transform: `translate(${tx}px, ${ty}px) scale(${s})`, opacity: op,
            }} />
          );
        })}
      </div>
    </Fill>
  );
}

/* ── Scene 2 · Message — headline builds ────────────────────────────── */
function Message() {
  const { progress } = useScene();
  const gone = fadeOut(progress, 0.9);
  const lines = ['נמצא יחד', 'את הליווי המתאים'];
  return (
    <Fill>
      <div style={{ textAlign: 'center', padding: '0 60px' }}>
        {lines.map((ln, i) => {
          const t = Easing.easeOutCubic(clamp((progress - 0.1 - i * 0.16) / 0.28, 0, 1));
          return (
            <div key={i} style={{
              fontSize: i === 0 ? 76 : 100, fontWeight: 800,
              color: i === 0 ? MUTED : PLUM, lineHeight: 1.18,
              opacity: t * gone, transform: `translateY(${(1 - t) * 26}px)`,
              letterSpacing: '-0.01em',
            }}>{ln}</div>
          );
        })}
      </div>
    </Fill>
  );
}

/* ── Scene 3 · Pillars — the three-word tagline ─────────────────────── */
function Pillars() {
  const { progress } = useScene();
  const gone = fadeOut(progress, 0.9);
  const items = [
    { w: 'תמיכה', c: PLUM },
    { w: 'שילוב', c: SLATE },
    { w: 'קהילה', c: TEAL },
  ];
  return (
    <Fill>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 44, alignItems: 'center' }}>
        {items.map((it, i) => {
          const t = Easing.easeOutBack(clamp((progress - 0.08 - i * 0.2) / 0.34, 0, 1));
          const tc = clamp((progress - 0.08 - i * 0.2) / 0.34, 0, 1);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 28,
              opacity: tc * gone, transform: `translateX(${(1 - tc) * -40}px)`,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: it.c, transform: `scale(${Math.max(0, t)})` }} />
              <div style={{ fontSize: 96, fontWeight: 800, color: it.c, letterSpacing: '-0.01em' }}>{it.w}</div>
            </div>
          );
        })}
      </div>
    </Fill>
  );
}

/* ── Scene 4 · Lockup — logo payoff ─────────────────────────────────── */
function Lockup() {
  const { progress } = useScene();
  const logoT = Easing.easeOutCubic(clamp(progress / 0.24, 0, 1));
  const logoScale = 0.78 + 0.22 * logoT;
  const ring = clamp((progress - 0.12) / 0.4, 0, 1);
  const tagT = Easing.easeOutCubic(clamp((progress - 0.42) / 0.3, 0, 1));
  return (
    <Fill>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{
          position: 'absolute', top: 60, left: '50%', width: 520, height: 520,
          marginLeft: -260, borderRadius: '50%', border: `3px solid ${TEAL_SOFT}`,
          transform: `translate(-0px,-0px) scale(${0.4 + ring * 1.1})`,
          opacity: (1 - ring) * 0.6,
        }} />
        <img src={(window.__resources && window.__resources.logo) || 'assets/logo.png'} alt="בשילוב" style={{
          width: 620, height: 'auto', position: 'relative',
          opacity: logoT, transform: `scale(${logoScale})`, transformOrigin: 'center',
        }} />
      </div>
    </Fill>
  );
}

/* ── Top-level: stage + tweaks (aspect ratio, motion editor) ────────── */
function Promo() {
  const { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle } = window;
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const ratio = t.aspect || '9:16';
  const dims = ratio === '1:1' ? { w: 1080, h: 1080 } : { w: 1080, h: 1920 };
  return (
    <React.Fragment>
      <window.SceneStage
        width={dims.w} height={dims.h}
        scenes={window.OM_SCENES} playback={window.OM_PLAYBACK}
        bg={CREAM} transition="cut">
        {{ Opening, Message, Pillars, Lockup }}
      </window.SceneStage>
      <TweaksPanel>
        <TweakSection label="פורמט" />
        <TweakRadio label="יחס" value={ratio} options={['9:16', '1:1']}
                    onChange={(v) => setTweak('aspect', v)} />
        <TweakSection label="עריכה" />
        <TweakToggle label="עורך תנועה" value={t.motionEditor}
                     onChange={(v) => setTweak('motionEditor', v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

window.PromoScenes = { Opening, Message, Pillars, Lockup };
window.Promo = Promo;

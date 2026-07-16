/* combined bundle: animations-v2 + tweaks-panel + promo-scenes */
(function(){
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
// Copied omelette starter. Re-running copy_starter_component with this kind overwrites this file with the latest version (page content is unaffected).

/* BEGIN USAGE */
// animations-v2.jsx — timeline animation engine with scene sequencing.
// Exports (on window): Stage, Sprite, TextSprite, ImageSprite, RectSprite,
//   VideoSprite, PlaybackBar, Easing, interpolate, animate, clamp,
//   useTime, useTimeline, useSprite, SceneStage, useScene.
//
// ALWAYS structure the piece as a scene sequence — even a single-scene
// piece is a one-entry list. Do NOT also load animations.jsx: v2 contains
// the whole engine (same globals; loading both means last-wins).
//   <x-import component-from-global-scope="MyPiece"
//             from="./animations-v2.jsx ./my-piece.jsx"></x-import>
//
// THE AUTHORING CONTRACT — this is what makes the host timeline's
// trim/stretch/reorder gestures write back into YOUR file, so follow it
// exactly:
//   1. Declare the scene list as a JSON string literal in a plain inline
//      <script> of the main document (NOT type="text/babel", NOT a sibling
//      .jsx — only vanilla inline scripts are addressable for write-back):
//        <script>window.OM_SCENES = '[{"name":"Opening","dur":3},{"name":"Peak","dur":4.5}]';</script>
//   2. Pass the string through untouched: <SceneStage scenes={window.OM_SCENES} ...>
//   3. Map scene names to components via the children object.
//   IMPORTANT — the exportable-video contract: SceneStage/Stage OWNS it
//   (the data-om-exportable-video-with-duration-secs attribute, the
//   data-om-seek-to-time-frame listener, the svg/foreignObject wrapper,
//   and font inlining). NEVER put the exportable attribute on any other
//   element — wrapping the stage in a second "exportable root" makes the
//   host timeline and the video exporter bind to the wrong element, and
//   playback control / export silently break.
//   4. ALSO declare the playback setting the same way — this is what makes
//      the host timeline's Repeat control write back into your file:
//        <script>window.OM_PLAYBACK = '{"mode":"loop"}';</script>
//      and pass it through untouched: <SceneStage playback={window.OM_PLAYBACK} ...>
//      Values: '{"mode":"loop"}' (play forever, the default) or
//      '{"mode":"times","count":N}' (play N times, then hold the last
//      frame). Omitting it keeps loop behavior but leaves the host
//      control read-only for this document.
//
//   IMPORTANT — the exportable-video contract: SceneStage/Stage OWNS it
//   (the data-om-exportable-video-with-duration-secs attribute, the
//   data-om-seek-to-time-frame listener, the svg/foreignObject wrapper,
//   and font inlining). NEVER put the exportable attribute on any other
//   element — wrapping the stage in a second "exportable root" makes the
//   host timeline and the video exporter bind to the wrong element, and
//   playback control / export silently break.
//
//   <SceneStage width={1280} height={720} scenes={window.OM_SCENES}
//               bg="#0b0b0e">
//     {{ 'Opening': Opening, 'Peak': Peak }}
//   </SceneStage>
//
// SceneStage({width, height, scenes, bg, autoplay=true, loop=true,
//   transition='cut', children}) — wraps Stage. Scenes play in authored order; total
// duration is the sum of durs, kept in sync with the exportable attr
// automatically. The host timeline shows the scenes as blocks: dragging
// an edge retimes one scene, dragging the time ruler retimes ALL of them
// proportionally, dragging a block's body reorders — and every edit lands
// in the JSON literal in source, then the composition reflows live (no
// reload) via the data-om-timeline-scenes-update event.
//
// TIMING IS USER-EDITABLE (time-stretch): when the user changes a scene's
// length, the engine remaps your scene clock so the SAME choreography
// plays faster or slower — never cut off. That only works for motion
// driven by the scene clock, so inside a scene component ALWAYS animate
// from useScene()'s {localTime, progress} (never your own clock, never
// useTime directly).
//
// The same rule is what makes video export exact AND fast: the exporter
// seeks each frame with a synchronous commit and may serialize the stage
// the moment the seek event returns — anything painted from useEffect or
// your own requestAnimationFrame lags that commit and exports stale.
// Render everything visible from the scene clock's values and this is
// automatic. (Nested <VideoSprite> videos are handled by the exporter.)
//
// TRANSITIONS: scene boundaries are hard cuts by default
// (transition="cut") — exactly one scene is mounted at any time. Scene
// layers are keyed by scene index, so inactive scenes are fully unmounted
// (they do zero per-frame work) and a scene never leaks component state
// into a neighbor, even when two adjacent scenes use the same component.
//   transition="overlap" is opt-in and for OPAQUE scenes only: during
// playback the outgoing scene stays mounted beneath the incoming one for
// ~2 frames, frozen at the frame it had just rendered, so the moments
// where the incoming scene hasn't painted real content yet (an <img>
// still decoding, a <video> before its first frame) show the outgoing
// scene rather than a flash of stage background. It cannot fix content
// that paints WRONG — a video whose first frame paints black paints
// black over the underlay too. Only use it
// when every scene paints the full frame — a scene on a transparent stage
// background will show the previous scene through it (ghosting); keep
// "cut" for those. Paused seeks and video-export frame seeks
// (data-om-seek-to-time-frame) never overlap — a seeked frame always
// renders exactly one scene's state. Playback driven by the EDITOR's
// play bar counts as playback too: the host marks its play-loop seeks
// (detail.playing === true on the same seek event) and the engine reads
// the marked stream as continuous playback, so overlap may engage —
// including across the loop seam, matching self-driven playback — while
// unmarked seeks (scrubs, steps, export frames) keep the
// exactly-one-scene rule. A tick-sized forward step or drag
// WHILE PLAYING reads as playback and may briefly overlap (bounded, ~2
// frames). The loop wrap (last scene back to the first, when loop is on —
// the default) is a boundary like any other and overlaps too, so the
// frame-match contract below applies across the loop seam as well.
//
// THE FRAME-MATCH CONTRACT (this is what makes boundaries seamless, in
// BOTH modes): a scene's entry/exit effects must be 0 at progress 0 and
// at progress 1 — its first and last rendered frames are the settled
// composition, with entrances and exits choreographed strictly inside
// (0, 1). No entry-only squash/rotation/opacity: a scene whose frame at
// progress 0 is mid-squash, rotated, or transparent pops at every cut and
// ghosts under overlap.
//
// The provided sprites bake in entry/exit fades (entryDur/exitDur), so a
// sprite that spans a scene edge violates the contract by construction:
// set entryDur={0} on sprites alive at the scene's first frame and
// exitDur={0} on sprites alive at its last, or inset the sprite's span so
// its fades complete inside the scene. The flip side: a scene that exits
// to fully transparent shows NOTHING at its last frame, so "overlap"
// would hold an empty underlay — following the contract is what makes
// overlap worth turning on.
//
// Scene entries are independent component instances, even when two names
// map to the same component — state never carries across a boundary. For
// one continuous component spanning a retimable stretch (a <video> that
// must keep playing through), use a single scene entry with extra fields
// driving its phases, not two entries of the same component.
//
// Each scene entry may carry extra fields ({"name":"Peak","dur":4,
// "text":"ACME"}) — the active scene component receives the whole entry as
// `scene` plus {localTime, progress, dur, index, count}, and can call
// useScene() anywhere below. Scenes own their entrances/exits — ramp any
// effect up only AFTER progress 0 and settle it back to 0 BEFORE progress
// 1, per THE FRAME-MATCH CONTRACT above. The optional "nat" field is the engine's
// time-stretch anchor — the host timeline manages it; don't set it by
// hand.
/* END USAGE */

// ─────────────────────────────────────────────────────────────────────────────

// ── Easing functions (hand-rolled, Popmotion-style) ─────────────────────────
// All easings take t ∈ [0,1] and return eased t ∈ [0,1] (may overshoot for back/elastic).
const Easing = {
  linear: (t) => t,

  // Quad
  easeInQuad:    (t) => t * t,
  easeOutQuad:   (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  // Cubic
  easeInCubic:    (t) => t * t * t,
  easeOutCubic:   (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),

  // Quart
  easeInQuart:    (t) => t * t * t * t,
  easeOutQuart:   (t) => 1 - (--t) * t * t * t,
  easeInOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t),

  // Expo
  easeInExpo:  (t) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return 0.5 * Math.pow(2, 20 * t - 10);
    return 1 - 0.5 * Math.pow(2, -20 * t + 10);
  },

  // Sine
  easeInSine:    (t) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine:   (t) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,

  // Back (overshoot)
  easeOutBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeInOutBack: (t) => {
    const c1 = 1.70158, c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },

  // Elastic
  easeOutElastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

// ── Core interpolation helpers ──────────────────────────────────────────────

// Clamp a value to [min, max]
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// interpolate([0, 0.5, 1], [0, 100, 50], ease?) -> fn(t)
// Popmotion-style: linearly maps t across input keyframes to output values,
// with optional easing per segment (single fn or array of fns).
function interpolate(input, output, ease = Easing.linear) {
  return (t) => {
    if (t <= input[0]) return output[0];
    if (t >= input[input.length - 1]) return output[output.length - 1];
    for (let i = 0; i < input.length - 1; i++) {
      if (t >= input[i] && t <= input[i + 1]) {
        const span = input[i + 1] - input[i];
        const local = span === 0 ? 0 : (t - input[i]) / span;
        const easeFn = Array.isArray(ease) ? (ease[i] || Easing.linear) : ease;
        const eased = easeFn(local);
        return output[i] + (output[i + 1] - output[i]) * eased;
      }
    }
    return output[output.length - 1];
  };
}

// animate({from, to, start, end, ease})(t) — simpler single-segment tween.
// Returns `from` before `start`, `to` after `end`.
function animate({ from = 0, to = 1, start = 0, end = 1, ease = Easing.easeInOutCubic }) {
  return (t) => {
    if (t <= start) return from;
    if (t >= end) return to;
    const local = (t - start) / (end - start);
    return from + (to - from) * ease(local);
  };
}

// ── Timeline context ────────────────────────────────────────────────────────

const TimelineContext = React.createContext({ time: 0, duration: 10, playing: false });

const useTime = () => React.useContext(TimelineContext).time;
const useTimeline = () => React.useContext(TimelineContext);

// ── Sprite ──────────────────────────────────────────────────────────────────
// Renders children only when the playhead is inside [start, end]. Provides
// a sub-context with `localTime` (seconds since start) and `progress` (0..1).
//
//   <Sprite start={2} end={5}>
//     {({ localTime, progress }) => <Thing x={progress * 100} />}
//   </Sprite>
//
// Or as a plain wrapper — children can call useSprite() themselves.

const SpriteContext = React.createContext({ localTime: 0, progress: 0, duration: 0 });
const useSprite = () => React.useContext(SpriteContext);

function Sprite({ start = 0, end = Infinity, children, keepMounted = false }) {
  const { time } = useTimeline();
  const visible = time >= start && time <= end;
  if (!visible && !keepMounted) return null;

  const duration = end - start;
  const localTime = Math.max(0, time - start);
  const progress = duration > 0 && isFinite(duration)
    ? clamp(localTime / duration, 0, 1)
    : 0;

  const value = { localTime, progress, duration, visible };

  return (
    <SpriteContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </SpriteContext.Provider>
  );
}

// ── Sample sprite components ────────────────────────────────────────────────

// TextSprite: fades/slides text in on entry, holds, then fades out on exit.
// Props: text, x, y, size, color, font, entryDur, exitDur, align
function TextSprite({
  text,
  x = 0, y = 0,
  size = 48,
  color = '#111',
  font = 'Inter, system-ui, sans-serif',
  weight = 600,
  entryDur = 0.45,
  exitDur = 0.35,
  entryEase = Easing.easeOutBack,
  exitEase = Easing.easeInCubic,
  align = 'left',
  letterSpacing = '-0.01em',
}) {
  const { localTime, duration } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);

  let opacity = 1;
  let ty = 0;

  if (localTime < entryDur) {
    const t = entryEase(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    ty = (1 - t) * 16;
  } else if (localTime > exitStart) {
    const t = exitEase(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    ty = -t * 8;
  }

  const translateX = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      transform: `translate(${translateX}, ${ty}px)`,
      opacity,
      fontFamily: font,
      fontSize: size,
      fontWeight: weight,
      color,
      letterSpacing,
      whiteSpace: 'pre',
      lineHeight: 1.1,
      willChange: 'transform, opacity',
    }}>
      {text}
    </div>
  );
}

// ImageSprite: scales + fades in; optional Ken Burns drift during hold.
function ImageSprite({
  src,
  x = 0, y = 0,
  width = 400, height = 300,
  entryDur = 0.6,
  exitDur = 0.4,
  kenBurns = false,
  kenBurnsScale = 1.08,
  radius = 12,
  fit = 'cover',
  placeholder = null, // {label: string} for striped placeholder
}) {
  const { localTime, duration } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);

  let opacity = 1;
  let scale = 1;

  if (localTime < entryDur) {
    const t = Easing.easeOutCubic(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    scale = 0.96 + 0.04 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInCubic(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = (kenBurns ? kenBurnsScale : 1) + 0.02 * t;
  } else if (kenBurns) {
    const holdSpan = exitStart - entryDur;
    const holdT = holdSpan > 0 ? (localTime - entryDur) / holdSpan : 0;
    scale = 1 + (kenBurnsScale - 1) * holdT;
  }

  const content = placeholder ? (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'repeating-linear-gradient(135deg, #e9e6df 0 10px, #dcd8cf 10px 20px)',
      color: '#6b6458',
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      fontSize: 13,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>
      {placeholder.label || 'image'}
    </div>
  ) : (
    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: fit, display: 'block' }} />
  );

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width, height,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      borderRadius: radius,
      overflow: 'hidden',
      willChange: 'transform, opacity',
    }}>
      {content}
    </div>
  );
}

// RectSprite: simple rectangle that animates position/size/color via props.
// Useful demo primitive — takes a `render` fn for per-frame customization.
function RectSprite({
  x = 0, y = 0,
  width = 100, height = 100,
  color = '#111',
  radius = 8,
  entryDur = 0.4,
  exitDur = 0.3,
  render, // optional: (ctx) => style overrides
}) {
  const spriteCtx = useSprite();
  const { localTime, duration } = spriteCtx;
  const exitStart = Math.max(0, duration - exitDur);

  let opacity = 1;
  let scale = 1;

  if (localTime < entryDur) {
    const t = Easing.easeOutBack(clamp(localTime / entryDur, 0, 1));
    opacity = clamp(localTime / entryDur, 0, 1);
    scale = 0.4 + 0.6 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInQuad(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = 1 - 0.15 * t;
  }

  const overrides = render ? render(spriteCtx) : {};

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width, height,
      background: color,
      borderRadius: radius,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      willChange: 'transform, opacity',
      ...overrides,
    }} />
  );
}


// ── Font inlining ───────────────────────────────────────────────────────────
// Copy every @font-face rule from the page into a <style> inside the svg's
// foreignObject, with font URLs rewritten to data: URLs. Makes the svg
// self-describing so serializing it alone (video export fast path) still
// renders with the right fonts. Sets data-om-fonts-inlined on the svg when
// done so the exporter can wait for it.

function useInlineFontsInto(svgRef) {
  React.useEffect(() => {
    const svg = svgRef.current;
    const host = svg && svg.querySelector('foreignObject > div');
    if (!svg || !host) return;
    let cancelled = false;
    (async () => {
      const rules = [];
      for (const ss of document.styleSheets) {
        let cssRules;
        try { cssRules = ss.cssRules; } catch {
          // Cross-origin sheet without crossorigin attr (e.g. the standard
          // fonts.googleapis.com <link>) — fetch the CSS text directly and
          // regex-extract the @font-face blocks.
          if (ss.href) {
            try {
              const txt = await fetch(ss.href).then(r => { if (!r.ok) throw 0; return r.text(); });
              for (const ff of (txt.match(/@font-face\s*{[^}]*}/g) || []))
                rules.push({ css: ff, base: ss.href });
            } catch {}
          }
          continue;
        }
        if (!cssRules) continue;
        for (const r of cssRules) {
          if (r.type === CSSRule.FONT_FACE_RULE) {
            rules.push({ css: r.cssText, base: ss.href || location.href });
          }
        }
      }
      const toDataURL = (url) => fetch(url)
        .then(r => { if (!r.ok) throw 0; return r.blob(); })
        .then(b => new Promise(res => {
          const fr = new FileReader();
          fr.onload = () => res(fr.result);
          fr.onerror = () => res(url);
          fr.readAsDataURL(b);
        }))
        .catch(() => url);
      const parts = await Promise.all(rules.map(async ({ css, base }) => {
        const re = /url\((['"]?)([^'")]+)\1\)/g;
        let out = css, m;
        while ((m = re.exec(css))) {
          const u = m[2];
          if (u.startsWith('data:')) continue;
          let abs; try { abs = new URL(u, base).href; } catch { continue; }
          out = out.split(m[0]).join(`url("${await toDataURL(abs)}")`);
        }
        return out;
      }));
      if (cancelled || !parts.length) {
        svg.setAttribute('data-om-fonts-inlined', 'true');
        return;
      }
      const style = document.createElement('style');
      style.textContent = parts.join('\n');
      host.insertBefore(style, host.firstChild);
      svg.setAttribute('data-om-fonts-inlined', 'true');
    })();
    return () => { cancelled = true; };
  }, []);
}


function Stage({
  width = 1280,
  height = 720,
  duration = 10,
  background = '#f6f4ef',
  fps = 60,
  loop = true,
  autoplay = true,
  // Parsed playback object ({mode:'loop'} | {mode:'times',count:N}) or
  // null. When present it overrides the legacy loop prop — SceneStage
  // passes the validated value from the OM_PLAYBACK authoring contract.
  playback = null,
  persistKey = 'animstage',
  children,
}) {
  // Props arrive as strings when Stage is mounted via <x-import> (DC
  // projects) — coerce so style={{width}} gets a number React can px-ify.
  width = +width || 1280; height = +height || 720;
  duration = +duration || 10; fps = +fps || 60;
  if (typeof loop === 'string') loop = loop !== 'false';
  if (typeof autoplay === 'string') autoplay = autoplay !== 'false';
  const playTimes = playback && playback.mode === 'times' ? playback.count : null;
  const loopEff = playback ? playback.mode === 'loop' : loop;

  const [time, setTime] = React.useState(() => {
    try {
      const v = parseFloat(localStorage.getItem(persistKey + ':t') || '0');
      return isFinite(v) ? clamp(v, 0, duration) : 0;
    } catch { return 0; }
  });
  const [playing, setPlaying] = React.useState(autoplay);
  // The external-playback latch: true while the HOST play bar is driving
  // time forward as genuine continuous playback (its play-loop seeks
  // carry detail.playing === true). The engine's own clock stays paused
  // the whole time — exactly one clock ever drives — so this is a
  // separate bit, not a second meaning for `playing`. Set and cleared
  // in the seek handler below; decays via SS_EXT_PLAY_MS when the
  // marked stream stops without a parting unmarked seek.
  const [extPlay, setExtPlay] = React.useState(false);
  const extPlayTimerRef = React.useRef(null);
  const [hoverTime, setHoverTime] = React.useState(null);
  const [scale, setScale] = React.useState(1);

  const stageRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const lastTsRef = React.useRef(null);

  // Persist playhead
  React.useEffect(() => {
    try { localStorage.setItem(persistKey + ':t', String(time)); } catch {}
  }, [time, persistKey]);

  // Auto-scale to fit viewport
  React.useEffect(() => {
    if (!stageRef.current) return;
    const el = stageRef.current;
    const measure = () => {
      const barH = 44; // playback bar height
      const s = Math.min(
        el.clientWidth / width,
        (el.clientHeight - barH) / height
      );
      setScale(Math.max(0.05, s));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [width, height]);

  // Passes completed since playback last started. Lives in a ref so the
  // per-frame wrap can count without re-running this effect; reset on
  // every (re)start so a fresh play (or a host restart) gets the full
  // run count again.
  const passesRef = React.useRef(0);

  // Animation loop
  React.useEffect(() => {
    if (!playing) {
      lastTsRef.current = null;
      return;
    }
    passesRef.current = 0;
    const step = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      setTime((t) => {
        let next = t + dt;
        if (next >= duration) {
          if (playTimes !== null) {
            // Play N times then hold the last frame — the partial pass a
            // mid-timeline start produces counts as a pass, so the piece
            // never runs longer than N full durations.
            passesRef.current += 1;
            if (passesRef.current >= playTimes) {
              next = duration;
              setPlaying(false);
            } else {
              next = next % duration;
            }
          } else if (loopEff) {
            next = next % duration;
          } else {
            next = duration; setPlaying(false);
          }
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [playing, duration, loopEff, playTimes]);

  // Keyboard: space = play/pause, ← → = seek
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setPlaying(p => !p);
      } else if (e.code === 'ArrowLeft') {
        setTime(t => clamp(t - (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.code === 'ArrowRight') {
        setTime(t => clamp(t + (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.key === '0' || e.code === 'Home') {
        setTime(0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [duration]);

  // Video-export protocol + the editor's play bar: hosts dispatch this
  // event per frame; pause + sync the playhead so the frame shows exactly
  // that timestamp. The host play bar marks its play-loop seeks with
  // detail.playing === true — the mark latches extPlay (playback is
  // playback even when a host clock drives it), while ANY unmarked seek
  // (scrub, step, export frame, the transport's pause park) clears the
  // latch in the same commit it retimes, so a seeked frame still renders
  // exactly one scene's state. The engine's own clock pauses either way.
  React.useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    // Sync-seek capability: a dispatcher that marks its seek with
    // detail.sync === true gets the commit applied via ReactDOM.flushSync,
    // so the stage DOM reflects the seeked frame the moment dispatchEvent
    // returns. The video exporter keys off the data-om-sync-seek
    // advertisement to drop its two-display-refresh settle (that wait only
    // exists to let React's async commit land — serialization needs the
    // committed DOM, not the paint). Feature-detected: a runtime without
    // ReactDOM.flushSync never advertises and every seek takes the async
    // path. Unmarked seeks (scrubs, the host play bar) stay async — a
    // forced sync render per pointermove would tax the editor for no one.
    const canSyncSeek =
      typeof ReactDOM !== 'undefined' &&
      typeof ReactDOM.flushSync === 'function';
    const onSeek = (e) => {
      const apply = () => {
        setPlaying(false);
        const hostPlay = !!(e.detail && e.detail.playing === true);
        if (extPlayTimerRef.current) {
          clearTimeout(extPlayTimerRef.current);
          extPlayTimerRef.current = null;
        }
        if (hostPlay) {
          // Watchdog: the latch is only as alive as its seek stream. If the
          // host stops without a parting seek (tab jank, bar unmount), the
          // latch decays on its own — and the expiry setState is itself the
          // render that lets SceneSwitch drop an open window, so expiry can
          // never strand a frozen two-layer frame.
          extPlayTimerRef.current = setTimeout(() => {
            extPlayTimerRef.current = null;
            setExtPlay(false);
          }, SS_EXT_PLAY_MS);
        }
        setExtPlay(hostPlay);
        setTime(clamp(e.detail.time, 0, duration));
      };
      // flushSync is safe here: a native DOM listener runs outside React's
      // lifecycle, and the exporter's dispatchEvent is synchronous, so the
      // commit lands in the same JS task — the engine's own rAF loop can
      // never interleave between seek and serialize.
      if (canSyncSeek && e.detail && e.detail.sync === true) {
        ReactDOM.flushSync(apply);
      } else {
        apply();
      }
    };
    el.addEventListener('data-om-seek-to-time-frame', onSeek);
    if (canSyncSeek) el.setAttribute('data-om-sync-seek', 'true');
    return () => {
      el.removeEventListener('data-om-seek-to-time-frame', onSeek);
      el.removeAttribute('data-om-sync-seek');
      if (extPlayTimerRef.current) {
        clearTimeout(extPlayTimerRef.current);
        extPlayTimerRef.current = null;
      }
      // Drop the latch too: this cleanup runs on every duration change
      // (an agent edit can retime mid-host-play, no gesture involved) and
      // the new effect instance arms no watchdog — clearing only the
      // timer could strand extPlay true forever if the marked stream died
      // in the gap. Fail toward cut: the next marked seek re-latches.
      setExtPlay(false);
    };
  }, [duration]);

  // Inline @font-face rules into the svg's foreignObject so the svg is
  // self-describing — serializing it alone (for video export) then renders
  // with the right fonts. Sets data-om-fonts-inlined once done.
  useInlineFontsInto(canvasRef);

  const displayTime = hoverTime != null ? hoverTime : time;

  const ctxValue = React.useMemo(
    // extPlaying is ADDITIVE: "time is advancing under an external
    // driver's continuous playback". `playing` keeps meaning the
    // engine's OWN clock — the hidden PlaybackBar glyph (and through it
    // the host's clock-reporter/adoption channel) reads that — and
    // SceneSwitch is the one consumer that widens to either.
    () => ({
      time: displayTime, duration, playing,
      extPlaying: extPlay,
      setTime, setPlaying,
    }),
    [displayTime, duration, playing, extPlay]
  );

  return (
    <div
      ref={stageRef}
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        background: '#0a0a0a',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Canvas area — vertically centered in remaining space */}
      <div style={{
        flex: 1,
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        <svg
          ref={canvasRef}
          width={width} height={height}
          data-om-exportable-video-with-duration-secs={duration}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            flexShrink: 0,
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            display: 'block',
          }}
        >
          <foreignObject x="0" y="0" width="100%" height="100%">
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              style={{
                width, height,
                background,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <TimelineContext.Provider value={ctxValue}>
                {children}
              </TimelineContext.Provider>
            </div>
          </foreignObject>
        </svg>
      </div>

      {/* Playback bar — stacked below canvas, never overlapping */}
      <PlaybackBar
        time={displayTime}
        actualTime={time}
        duration={duration}
        playing={playing}
        onPlayPause={() => setPlaying(p => !p)}
        onReset={() => { setTime(0); }}
        onSeek={(t) => setTime(t)}
        onHover={(t) => setHoverTime(t)}
      />
    </div>
  );
}

// ── Playback bar ────────────────────────────────────────────────────────────
// Play/pause, return-to-begin, scrub track, time display.
// Uses fixed-width time fields so layout doesn't thrash.

function PlaybackBar({ time, duration, playing, onPlayPause, onReset, onSeek, onHover }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);

  const timeFromEvent = React.useCallback((e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    return x * duration;
  }, [duration]);

  const onTrackMove = (e) => {
    if (!trackRef.current) return;
    const t = timeFromEvent(e);
    if (dragging) {
      onSeek(t);
    } else {
      onHover(t);
    }
  };

  const onTrackLeave = () => {
    if (!dragging) onHover(null);
  };

  const onTrackDown = (e) => {
    setDragging(true);
    const t = timeFromEvent(e);
    onSeek(t);
    onHover(null);
  };

  React.useEffect(() => {
    if (!dragging) return;
    const onUp = () => setDragging(false);
    const onMove = (e) => {
      if (!trackRef.current) return;
      const t = timeFromEvent(e);
      onSeek(t);
    };
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
    };
  }, [dragging, timeFromEvent, onSeek]);

  const pct = duration > 0 ? (time / duration) * 100 : 0;
  const fmt = (t) => {
    const total = Math.max(0, t);
    const m = Math.floor(total / 60);
    const s = Math.floor(total % 60);
    const cs = Math.floor((total * 100) % 100);
    return `${String(m).padStart(1, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };

  const mono = 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace';

  return (
    <div data-omelette-chrome style={{
      // Slimmed to visually match the host editor bar's basic row (the
      // single-scrubber look): transport first, tighter metrics, quieter
      // chrome. Shown only outside the app — the host bar suppresses this
      // whenever it is present.
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '6px 12px',
      background: 'rgba(20,20,20,0.92)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      width: '100%',
      maxWidth: 680,
      alignSelf: 'center',

      borderRadius: 6,
      color: '#f6f4ef',
      fontFamily: 'Inter, system-ui, sans-serif',
      userSelect: 'none',
      flexShrink: 0,
    }}>
      <IconButton onClick={onPlayPause} title="Play/pause (space)">
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="3" y="2" width="3" height="10" fill="currentColor"/>
            <rect x="8" y="2" width="3" height="10" fill="currentColor"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 2l9 5-9 5V2z" fill="currentColor"/>
          </svg>
        )}
      </IconButton>
      <IconButton onClick={onReset} title="Return to start (0)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 2v10M12 2L5 7l7 5V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
        </svg>
      </IconButton>

      {/* Current time: fixed width so it doesn't thrash */}
      <div style={{
        fontFamily: mono,
        fontSize: 12,
        fontVariantNumeric: 'tabular-nums',
        width: 64, textAlign: 'right',
        color: '#f6f4ef',
      }}>
        {fmt(time)}
      </div>

      {/* Scrub track */}
      <div
        ref={trackRef}
        onMouseMove={onTrackMove}
        onMouseLeave={onTrackLeave}
        onMouseDown={onTrackDown}
        style={{
          flex: 1,
          height: 22,
          position: 'relative',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center',
        }}
      >
        <div style={{
          position: 'absolute',
          left: 0, right: 0, height: 4,
          background: 'rgba(255,255,255,0.12)',
          borderRadius: 2,
        }}/>
        <div style={{
          position: 'absolute',
          left: 0, width: `${pct}%`, height: 4,
          background: 'oklch(72% 0.12 250)',
          borderRadius: 2,
        }}/>
        <div style={{
          position: 'absolute',
          left: `${pct}%`, top: '50%',
          width: 12, height: 12,
          marginLeft: -6, marginTop: -6,
          background: '#fff',
          borderRadius: 6,
          boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
        }}/>
      </div>

      {/* Duration: fixed width */}
      <div style={{
        fontFamily: mono,
        fontSize: 12,
        fontVariantNumeric: 'tabular-nums',
        width: 64, textAlign: 'left',
        color: 'rgba(246,244,239,0.55)',
      }}>
        {fmt(duration)}
      </div>

      {typeof VideoEncoder !== 'undefined' && (
        <IconButton
          title="Export video"
          onClick={() => window.parent.postMessage({ type: 'omelette:request-video-export' }, '*')}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v7m0 0L4 6m3 3l3-3M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </IconButton>
      )}
    </div>
  );
}

function IconButton({ children, onClick, title }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 24, height: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hover ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 5,
        color: '#f6f4ef',
        cursor: 'pointer',
        padding: 0,
        transition: 'background 120ms',
      }}
    >
      {children}
    </button>
  );
}


// ── VideoSprite ─────────────────────────────────────────────────────────────
// Renders a <video> that loops within [start,end] of its source at `speed`,
// kept in sync with the Stage's playhead. Carries the
// data-om-exportable-video-play-* attrs so video export can mix its audio.
//
//   <VideoSprite src="clip.mp4" start={2} end={5} speed={1}
//     style={{ width: 640, height: 360 }} />

function VideoSprite({ src, start = 0, end, speed = 1, style, ...rest }) {
  start = +start || 0; speed = +speed || 1;
  if (end != null) end = +end || undefined;
  const t = useTime();
  const ref = React.useRef(null);
  const span = Math.max(0.001, ((end ?? start + 1) - start));
  React.useEffect(() => {
    const v = ref.current;
    if (!v || v.readyState < 1) return;
    const target = start + ((t * speed) % span);
    if (Math.abs(v.currentTime - target) > 0.05) v.currentTime = target;
  }, [t, start, span, speed]);
  return (
    <video
      ref={ref}
      src={src}
      muted playsInline preload="auto"
      data-om-exportable-video-play-start={start}
      data-om-exportable-video-play-end={end ?? start + span}
      data-om-exportable-video-play-speed={speed}
      style={{ display: 'block', objectFit: 'cover', ...style }}
      {...rest}
    />
  );
}


Object.assign(window, {
  Easing, interpolate, animate, clamp,
  TimelineContext, useTime, useTimeline,
  Sprite, SpriteContext, useSprite,
  TextSprite, ImageSprite, RectSprite, VideoSprite,
  Stage, PlaybackBar,
});

// ── Scene sequencing ─────────────────────────────────────────────────────
// Guest-side validation of a scene list (the engine's own inputs: the
// authored prop, and host-dispatched updates). Mirrors the host parser's
// shape rules and constants — keep in sync with parseTimelineScenes in
// apps/web/src/shared/timeline.ts (16KB raw cap, 50 entries, dur finite in
// (0, 300]); returns null on any violation.
function ssParse(raw) {
  if (typeof raw !== 'string' || !raw || raw.length > 16 * 1024) return null;
  var parsed;
  try { parsed = JSON.parse(raw); } catch (e) { return null; }
  if (!Array.isArray(parsed) || parsed.length === 0 || parsed.length > 50) return null;
  for (var i = 0; i < parsed.length; i++) {
    var s = parsed[i];
    if (typeof s !== 'object' || s === null) return null;
    if (typeof s.name !== 'string' || typeof s.dur !== 'number') return null;
    if (!isFinite(s.dur) || s.dur <= 0 || s.dur > 300) return null;
  }
  return parsed;
}

// Guest-side validation of the playback value — mirrors the host parser
// (shared/timeline.ts parseTimelinePlayback): {"mode":"loop"} or
// {"mode":"times","count":1..99}, strict all-or-nothing, null otherwise.
// Callers treat null as the loop default.
function ppParse(raw) {
  if (typeof raw !== 'string' || !raw || raw.length > 256) return null;
  var parsed;
  try { parsed = JSON.parse(raw); } catch (e) { return null; }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
  var keys = Object.keys(parsed);
  if (parsed.mode === 'loop') return keys.length === 1 ? { mode: 'loop' } : null;
  if (parsed.mode === 'times') {
    if (keys.length !== 2) return null;
    var c = parsed.count;
    if (typeof c !== 'number' || c !== Math.floor(c) || c < 1 || c > 99) return null;
    return { mode: 'times', count: c };
  }
  return null;
}

// Stamps the playback attribute VERBATIM from the authored raw string (the
// host's write-back anchors on that exact value) and listens for the
// host's post-write update event. Same shape as SceneSync; only rendered
// when the document authors a playback literal — an absent contract means
// the attribute stays absent and the document plays its default.
function PlaybackSync(props) {
  var ref = React.useRef(null);
  var raw = props.raw;
  var onUpdate = props.onUpdate;
  React.useEffect(function () {
    var el = ref.current;
    if (!el) return;
    var root = el.closest('[data-om-exportable-video-with-duration-secs]');
    if (!root) return;
    root.setAttribute('data-om-timeline-playback', raw);
    var onEvent = function (e) {
      var next = e && e.detail;
      if (ppParse(next)) onUpdate(next);
    };
    root.addEventListener('data-om-timeline-playback-update', onEvent);
    return function () {
      root.removeEventListener('data-om-timeline-playback-update', onEvent);
      root.removeAttribute('data-om-timeline-playback');
    };
  }, [raw, onUpdate]);
  return <div ref={ref} style={{ display: 'none' }} />;
}

var SceneContext = React.createContext(null);
function useScene() { return React.useContext(SceneContext); }

// Renders inside the Stage (so it can reach the exportable root via
// closest()): stamps the scenes attribute VERBATIM from the current raw
// string — the host's write-back anchors on that exact value — and listens
// for the host's post-write update event.
function SceneSync(props) {
  var ref = React.useRef(null);
  var raw = props.raw;
  var onUpdate = props.onUpdate;
  React.useEffect(function () {
    var el = ref.current;
    if (!el) return;
    var root = el.closest('[data-om-exportable-video-with-duration-secs]');
    if (!root) return;
    root.setAttribute('data-om-timeline-scenes', raw);
    var onEvent = function (e) {
      var next = e && e.detail;
      // Ignore anything that doesn't validate — a bad update must not tear
      // down a working composition.
      if (ssParse(next)) onUpdate(next);
    };
    root.addEventListener('data-om-timeline-scenes-update', onEvent);
    return function () {
      root.removeEventListener('data-om-timeline-scenes-update', onEvent);
      root.removeAttribute('data-om-timeline-scenes');
    };
  }, [raw, onUpdate]);
  return <div ref={ref} style={{ display: 'none' }} />;
}

// ── Scene transitions ────────────────────────────────────────────────────
// A boundary tick only counts as "natural playback" when the playhead
// advanced by at most this many seconds. The guard keeps scrubs and long
// jumps (which move time arbitrarily) from reading as playback, and it is
// deliberately loose: half a second admits playback down to 2fps, because
// a false negative silently disables overlap on exactly the heavy scenes
// it serves, while a false positive (a slow forward drag while playing)
// costs two cosmetic frames.
var SS_MAX_TICK = 0.5;
// How many engine ticks the outgoing scene stays mounted under
// transition="overlap": the boundary commit plus one more frame.
var SS_OVERLAP_TICKS = 2;
// Wall-clock ceiling on a window, backstopping the tick budget: ticks are
// only spent by renders, and a pinned clock (the PlaybackBar's hover
// preview holds displayTime still even while playing) stops producing
// them — without this ceiling, both layers could persist for as long as
// the mouse rests on the scrub track. 500ms keeps the tick budget intact
// for playback down to ~4fps; the nudge effect in SceneSwitch guarantees
// a render arrives to enforce it even when the clock is pinned.
var SS_OVERLAP_MAX_MS = 500;
// How long a marked (detail.playing === true) host seek keeps the
// external-playback latch alive with no successor. The host play bar's
// seek pump is one-in-flight/latest-wins, so its inter-seek gap is tens
// of milliseconds in the worst case — 400ms is far above that, and it
// sits below SS_OVERLAP_MAX_MS so a stream that dies mid-window decays
// the latch (and with it the window) no later than the window's own
// wall-clock ceiling would have closed it.
var SS_EXT_PLAY_MS = 400;

// True only for a boundary crossed by what reads as natural forward
// playback: the engine advancing one tick from scene i into scene i+1, or
// wrapping last→first under loop. Export seeks can never pass — the
// export protocol pauses before it retimes, and arming requires playing —
// and neither can paused scrubs or arrow-steps, host trim/reorder events
// (dt === 0), or long jumps. A forward drag or arrow-step WHILE PLAYING
// that lands just past a boundary does pass — it is indistinguishable
// from a playback tick by design — and costs a bounded, cosmetic
// two-frame window.
function ssNaturalAdvance(last, idx, t, count, total, playing, loopOn) {
  if (!playing || count < 2) return false;
  if (idx === last.idx + 1) {
    var dt = t - last.t;
    return dt > 0 && dt <= SS_MAX_TICK;
  }
  if (last.idx === count - 1 && idx === 0 && loopOn && t > 0) {
    // Without loop the engine never wraps (it clamps and pauses at the
    // end), so a wrap-shaped pair can only be a user gesture — a cut. And
    // the transport's reset gestures (return-to-start, Home, '0') land on
    // exactly t = 0 without pausing, while a genuine modulo wrap is almost
    // surely fractional — t > 0 rejects resets, and the cheap failure mode
    // is one skipped cosmetic overlap at the seam.
    var dtWrap = t + total - last.t;
    // Two layered defenses against a fake wrap after a mid-play trim
    // shrinks the total. When the wrap happens on the rAF loop's dt=0
    // re-priming tick (the engine path), t is exactly last.t % total, so
    // dtWrap is exactly 0 in IEEE arithmetic and the > 0 test rejects it.
    // When the clock is PINNED instead (the PlaybackBar hover preview sets
    // the displayed time directly, no re-priming tick), dtWrap can land
    // positive while t sits deep inside scene 0 — the t <= one-tick guard
    // is what rejects that path.
    return dtWrap > 0 && dtWrap <= SS_MAX_TICK && t <= SS_MAX_TICK;
  }
  return false;
}

// A scene's inner tree: the scene component under its two context
// providers. The nested TimelineContext.Provider exists in EVERY layer,
// not just frozen ones, for two reasons. Context propagation bypasses
// React's identical-element bailout, so a frozen layer needs a provider
// whose value has stopped changing — without one, Sprite/VideoSprite
// inside the frozen scene would keep reading the live clock through the
// outer provider, see time run past their spans, and blank out (or
// re-seek a video) mid-overlap. And the tree at a layer's keyed position
// must never change shape between roles: a current→previous type change
// would remount the subtree, the very thing the scene key exists to
// prevent. For the current layer the provider re-provides the live value
// unchanged, which is invisible to consumers.
function ssSceneInner(scenes, idx, wallTime, total, map, timelineValue) {
  var scene = scenes[idx];
  // TIME-STRETCH: when the entry carries "nat" (its natural/authored
  // duration — the host timeline stamps it on the first trim), the user's
  // dur edits retime the choreography rather than cutting it: localTime
  // runs 0..nat over dur wall-seconds, so compressing a scene plays the
  // SAME motion faster and stretching slows it. progress is unchanged
  // either way (localTime/nat === wallTime/dur). No nat → factor 1.
  var nat = typeof scene.nat === 'number' && isFinite(scene.nat) && scene.nat > 0
    ? scene.nat
    : scene.dur;
  var stretch = scene.dur > 0 ? nat / scene.dur : 1;
  var localTime = wallTime * stretch;
  var ctx = {
    scene: scene,
    localTime: localTime,
    progress: nat > 0 ? localTime / nat : 0,
    dur: nat,
    index: idx,
    count: scenes.length,
    total: total,
  };
  // Own-property lookup: a scene named "constructor" or "toString" must hit
  // the unmapped-scene diagnostic, not a prototype-chain member.
  var Comp = Object.prototype.hasOwnProperty.call(map, scene.name)
    ? map[scene.name]
    : null;
  return (
    <TimelineContext.Provider value={timelineValue}>
      <SceneContext.Provider value={ctx}>
        {Comp ? (
          <Comp {...ctx} />
        ) : (
          // An unmapped name renders a quiet diagnostic instead of a dead
          // frame — the mismatch is an authoring bug worth seeing.
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.25)',
            font: '500 18px Inter, system-ui, sans-serif',
          }}>unmapped scene: {scene.name}</div>
        )}
      </SceneContext.Provider>
    </TimelineContext.Provider>
  );
}

// One scene layer: the positioned wrapper that gives a scene its stable
// keyed identity (the scene's index in the authored list) and its role
// styling. The SAME entry keeps its DOM when its role changes (current →
// previous under "overlap" — no unmount/remount, so CSS transitions and
// <video>/<canvas> state survive), while DIFFERENT entries never share
// DOM, even when two adjacent scenes map to the same component type.
// zIndex is set only while an overlap window is active (frozen beneath,
// current above); outside a window the wrapper adds no stacking context.
function ssSceneLayer(idx, z, frozen, inner) {
  return (
    <div
      key={idx}
      data-om-scene-layer={idx}
      style={{
        position: 'absolute', inset: 0, zIndex: z,
        pointerEvents: frozen ? 'none' : undefined,
      }}
    >
      {inner}
    </div>
  );
}

// The active-scene selector. Lives INSIDE Stage so useTime sees the
// timeline context. Renders the current scene's layer — plus, under
// transition="overlap" and only across a naturally-played boundary, the
// outgoing scene's layer beneath it for SS_OVERLAP_TICKS engine ticks.
// The outgoing scene is frozen EXACTLY as last rendered: its stored inner
// element is reused by reference, so the underlay is the frame that was
// just on screen (no synthesized end state), React bails out of the
// identical element (the inactive scene does zero per-frame work), and
// its clock — both contexts — stays pinned at the pre-boundary values.
// The scene's own internal state updates still render: the clock is
// frozen, the subtree isn't dead.
function SceneSwitch(props) {
  var scenes = props.scenes;
  var map = props.map || {};
  var overlapMode = props.transition === 'overlap';
  var timeline = useTimeline();
  var t = timeline.time;
  // Playback is playback whichever clock drives it: the engine's own rAF
  // loop (timeline.playing) or the host play bar's marked seek stream
  // (timeline.extPlaying). Nothing that must stay a cut sets either bit —
  // scrubs, steps, and export frames arrive without the playing mark (an
  // export seek may carry detail.sync, which changes WHEN the commit
  // happens, not what it commits), and clear extPlaying in the same
  // commit they retime — so the window invariant's "a paused render is a
  // SEEK frame" reading is unchanged.
  var playing = timeline.playing || timeline.extPlaying === true;
  var starts = [0];
  for (var i = 0; i < scenes.length; i++) starts.push(starts[i] + scenes[i].dur);
  var total = starts[starts.length - 1];
  // The playhead's scene; the t === total edge (export's last frame, a
  // scrub parked at the end) belongs to the last scene, not to nothing.
  var idx = scenes.length - 1;
  for (var j = 0; j < scenes.length; j++) {
    if (t < starts[j + 1]) { idx = j; break; }
  }
  var wallTime = Math.min(Math.max(t - starts[idx], 0), scenes[idx].dur);

  var inner = ssSceneInner(scenes, idx, wallTime, total, map, timeline);

  // Overlap bookkeeping. It lives in refs and mutates during render, which
  // is safe here because the mutating branches are gated on (t, idx)
  // differing from the previous render's values — a double-invoked render
  // re-runs them as a no-op. (A discarded concurrent render could advance
  // the refs for a frame that never commits; this engine drives time with
  // urgent setState from rAF, so renders aren't interleaved — and the
  // worst case is an overlap window skipped or cut short, never a wrong
  // seeked frame.)
  var lastRef = React.useRef(null);     // {idx, t, inner} as of the previous render
  var overlayRef = React.useRef(null);  // the active window; invariant below

  // THE OVERLAP WINDOW INVARIANT. A window may exist only while ALL hold:
  //   1. the transition mode is 'overlap';
  //   2. this render is playing — a paused render is a SEEK frame (the
  //      export protocol pauses in the same commit as it retimes), and a
  //      seeked frame must show exactly one scene's state;
  //   3. the current scene is still the one the window opened into
  //      (idx === toIdx);
  //   4. the scenes array is the same object the window opened under (a
  //      host trim/reorder mid-window invalidates the frozen layer);
  //   5. fewer than SS_OVERLAP_TICKS distinct engine ticks have rendered
  //      since the boundary.
  // The clause below drops the window the moment ANY of these fails, and
  // dropping is terminal: a new window takes a new natural boundary.
  if (overlapMode && lastRef.current) {
    var last = lastRef.current;
    if (last.idx !== idx) {
      // Boundary crossed since the previous render: open a window only for
      // a natural advance, freezing the outgoing scene's last-rendered
      // tree. Anything else (seek, jump, edit) is a cut and clears any
      // window already open.
      overlayRef.current = ssNaturalAdvance(last, idx, t, scenes.length, total, playing, props.loop === true)
        ? {
            fromIdx: last.idx, toIdx: idx, scenes: scenes,
            ticks: 0, bornAt: Date.now(), inner: last.inner,
          }
        : null;
    } else if (overlayRef.current && last.t !== t) {
      overlayRef.current.ticks += 1;
    }
  }
  var ov = overlayRef.current;
  if (ov && (
    !overlapMode || !playing ||
    idx !== ov.toIdx ||
    scenes !== ov.scenes ||
    ov.ticks >= SS_OVERLAP_TICKS ||
    Date.now() - ov.bornAt > SS_OVERLAP_MAX_MS
  )) {
    overlayRef.current = ov = null;
  }
  lastRef.current = { idx: idx, t: t, inner: inner };

  // The nudge: while a window exists, guarantee a future render so the
  // checks above get a chance to run even if the clock pins (see
  // SS_OVERLAP_MAX_MS). On the normal path the window dies of its tick
  // budget first and the armed timeout is cleaned up without firing.
  var nudgeState = React.useState(0);
  var setNudge = nudgeState[1];
  React.useEffect(function () {
    if (!overlayRef.current) return undefined;
    var id = setTimeout(function () {
      setNudge(function (n) { return n + 1; });
    }, SS_OVERLAP_MAX_MS + 17);
    return function () { clearTimeout(id); };
  });

  if (!ov) return [ssSceneLayer(idx, undefined, false, inner)];
  return [
    ssSceneLayer(ov.fromIdx, 0, true, ov.inner),
    ssSceneLayer(idx, 1, false, inner),
  ];
}

function SceneStage(props) {
  var width = +props.width || 1280;
  var height = +props.height || 720;
  var bg = props.bg || '#0b0b0e';
  var autoplay = props.autoplay == null ? true : String(props.autoplay) !== 'false';
  var loop = props.loop == null ? true : String(props.loop) !== 'false';
  // Anything other than the exact string 'overlap' means the default 'cut'
  // — a typo must degrade to today's behavior, never to a new one.
  var transition = props.transition === 'overlap' ? 'overlap' : 'cut';
  // The raw string is state: a host write (trim/reorder) arrives as the
  // scenes-update event and re-renders the whole composition from the new
  // value — durations, order, AND the Stage duration — without a reload.
  var state = React.useState(props.scenes);
  var raw = state[0];
  var setRaw = state[1];
  var scenes = React.useMemo(function () { return ssParse(raw); }, [raw]);
  // Playback raw string is state for the same reason the scenes raw is:
  // a host write arrives as the update event and re-renders the engine
  // with the new mode, no reload. Invalid or absent degrades to the
  // legacy loop prop.
  var pstate = React.useState(props.playback);
  var praw = pstate[0];
  var setPraw = pstate[1];
  var pb = React.useMemo(function () { return ppParse(praw); }, [praw]);
  if (!scenes) {
    return (
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#0b0b0e', color: '#c96442',
        font: '500 16px Inter, system-ui, sans-serif', textAlign: 'center',
      }}>
        animations-v2: the scenes prop isn't a valid JSON scene list
        <br />(expected '[{'{'}"name":"…","dur":N{'}'}, …]')
      </div>
    );
  }
  var total = 0;
  for (var i = 0; i < scenes.length; i++) total += scenes[i].dur;
  total = Math.round(total * 1000) / 1000;
  // The loop-seam behavior (SceneSwitch's wrap overlap) follows the
  // EFFECTIVE mode: a run-N composition doesn't wrap on its final pass,
  // but its intermediate wraps cross the seam like any loop.
  var loopEff = pb ? pb.mode !== 'times' || pb.count > 1 : loop;
  var inner = (
    <React.Fragment>
      <SceneSync raw={raw} onUpdate={setRaw} />
      {typeof praw === 'string' && praw !== '' && (
        <PlaybackSync raw={praw} onUpdate={setPraw} />
      )}
      <SceneSwitch scenes={scenes} map={props.children} transition={transition}
                   loop={loopEff} />
    </React.Fragment>
  );
  return (
    <Stage width={width} height={height} duration={total} background={bg}
           autoplay={autoplay} loop={loop} playback={pb}>
      {inner}
    </Stage>
  );
}

Object.assign(window, { SceneStage, useScene });

})();
(function(){
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
// Copied omelette starter. Re-running copy_starter_component with this kind overwrites this file with the latest version (page content is unaffected).

/* BEGIN USAGE */
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
// Exports (to window): useTweaks, TweaksPanel, TweakSection, TweakRow, TweakSlider,
//   TweakToggle, TweakRadio, TweakSelect, TweakText, TweakNumber, TweakColor, TweakButton.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// TweakRadio is the segmented control for 2–3 short options (auto-falls-back to
// TweakSelect past ~16/~10 chars per label); reach for TweakSelect directly when
// options are many or long. For color tweaks always curate 3-4 options rather than
// a free picker; an option can also be a whole 2–5 color palette (the stored value
// is the array). The Tweak* controls are a floor, not a ceiling — build custom
// controls inside the panel if a tweak calls for UI they don't cover.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null
      ? keyOrEdits : { [keyOrEdits]: val };
    setValues((prev) => ({ ...prev, ...edits }));
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', { detail: edits }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({ title = 'Tweaks', children }) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({ x: 16, y: 16 });
  const PAD = 16;

  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth, h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y)),
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);

  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);

  React.useEffect(() => {
    const onMsg = (e) => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);
      else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
  };

  const onDragStart = (e) => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = (ev) => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy),
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  if (!open) return null;
  return (
    <>
      <style>{__TWEAKS_STYLE}</style>
      <div ref={dragRef} className="twk-panel" data-omelette-chrome=""
           style={{ right: offsetRef.current.x, bottom: offsetRef.current.y }}>
        <div className="twk-hd" onMouseDown={onDragStart}>
          <b>{title}</b>
          <button className="twk-x" aria-label="Close tweaks"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={dismiss}>✕</button>
        </div>
        <div className="twk-body">
          {children}
        </div>
      </div>
    </>
  );
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({ label, children }) {
  return (
    <>
      <div className="twk-sect">{label}</div>
      {children}
    </>
  );
}

function TweakRow({ label, value, children, inline = false }) {
  return (
    <div className={inline ? 'twk-row twk-row-h' : 'twk-row'}>
      <div className="twk-lbl">
        <span>{label}</span>
        {value != null && <span className="twk-val">{value}</span>}
      </div>
      {children}
    </div>
  );
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({ label, value, min = 0, max = 100, step = 1, unit = '', onChange }) {
  return (
    <TweakRow label={label} value={`${value}${unit}`}>
      <input type="range" className="twk-slider" min={min} max={max} step={step}
             value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </TweakRow>
  );
}

function TweakToggle({ label, value, onChange }) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl"><span>{label}</span></div>
      <button type="button" className="twk-toggle" data-on={value ? '1' : '0'}
              role="switch" aria-checked={!!value}
              onClick={() => onChange(!value)}><i /></button>
    </div>
  );
}

function TweakRadio({ label, value, options, onChange }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = (o) => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({ 2: 16, 3: 10 }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = (s) => {
      const m = options.find((o) => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return <TweakSelect label={label} value={value} options={options}
                        onChange={(s) => onChange(resolve(s))} />;
  }
  const opts = options.map((o) => (typeof o === 'object' ? o : { value: o, label: o }));
  const idx = Math.max(0, opts.findIndex((o) => o.value === value));
  const n = opts.length;

  const segAt = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor(((clientX - r.left - 2) / inner) * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };

  const onPointerDown = (e) => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = (ev) => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <TweakRow label={label}>
      <div ref={trackRef} role="radiogroup" onPointerDown={onPointerDown}
           className={dragging ? 'twk-seg dragging' : 'twk-seg'}>
        <div className="twk-seg-thumb"
             style={{ left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
                      width: `calc((100% - 4px) / ${n})` }} />
        {opts.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={o.value === value}>
            {o.label}
          </button>
        ))}
      </div>
    </TweakRow>
  );
}

function TweakSelect({ label, value, options, onChange }) {
  return (
    <TweakRow label={label}>
      <select className="twk-field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => {
          const v = typeof o === 'object' ? o.value : o;
          const l = typeof o === 'object' ? o.label : o;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </TweakRow>
  );
}

function TweakText({ label, value, placeholder, onChange }) {
  return (
    <TweakRow label={label}>
      <input className="twk-field" type="text" value={value} placeholder={placeholder}
             onChange={(e) => onChange(e.target.value)} />
    </TweakRow>
  );
}

function TweakNumber({ label, value, min, max, step = 1, unit = '', onChange }) {
  const clamp = (n) => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({ x: 0, val: 0 });
  const onScrubStart = (e) => {
    e.preventDefault();
    startRef.current = { x: e.clientX, val: value };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = (ev) => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return (
    <div className="twk-num">
      <span className="twk-num-lbl" onPointerDown={onScrubStart}>{label}</span>
      <input type="number" value={value} min={min} max={max} step={step}
             onChange={(e) => onChange(clamp(Number(e.target.value)))} />
      {unit && <span className="twk-num-unit">{unit}</span>}
    </div>
  );
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}

const __TwkCheck = ({ light }) => (
  <svg viewBox="0 0 14 14" aria-hidden="true">
    <path d="M3 7.2 5.8 10 11 4.2" fill="none" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
          stroke={light ? 'rgba(0,0,0,.78)' : '#fff'} />
  </svg>
);

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({ label, value, options, onChange }) {
  if (!options || !options.length) {
    return (
      <div className="twk-row twk-row-h">
        <div className="twk-lbl"><span>{label}</span></div>
        <input type="color" className="twk-swatch" value={value}
               onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = (o) => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return (
    <TweakRow label={label}>
      <div className="twk-chips" role="radiogroup">
        {options.map((o, i) => {
          const colors = Array.isArray(o) ? o : [o];
          const [hero, ...rest] = colors;
          const sup = rest.slice(0, 4);
          const on = key(o) === cur;
          return (
            <button key={i} type="button" className="twk-chip" role="radio"
                    aria-checked={on} data-on={on ? '1' : '0'}
                    aria-label={colors.join(', ')} title={colors.join(' · ')}
                    style={{ background: hero }}
                    onClick={() => onChange(o)}>
              {sup.length > 0 && (
                <span>
                  {sup.map((c, j) => <i key={j} style={{ background: c }} />)}
                </span>
              )}
              {on && <__TwkCheck light={__twkIsLight(hero)} />}
            </button>
          );
        })}
      </div>
    </TweakRow>
  );
}

function TweakButton({ label, onClick, secondary = false }) {
  return (
    <button type="button" className={secondary ? 'twk-btn secondary' : 'twk-btn'}
            onClick={onClick}>{label}</button>
  );
}

Object.assign(window, {
  useTweaks, TweaksPanel, TweakSection, TweakRow,
  TweakSlider, TweakToggle, TweakRadio, TweakSelect,
  TweakText, TweakNumber, TweakColor, TweakButton,
});

})();
(function(){
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

})();

import {useStore} from "@nanostores/solid";
import {createEffect, createMemo, createSignal, For, onCleanup, onMount, Show, type Accessor} from "solid-js";
import {Transition} from "solid-transition-group";
import {ButtonLink} from "../components/Button";
import ProjectIllustration from "../components/ProjectIllustration";
import {$activityStatuses, $featuredProject, $isLoading, $status, ActivityStatus, Status} from "../store";

const MainPage = () => {
  const [secretVisible, setSecretVisible] = createSignal(false);
  const [developerNotice, setDeveloperNotice] = createSignal<{message: string; unlocked: boolean} | null>(null);
  let typedKeys = "";
  let secretTimer: number | undefined;
  let developerTapCount = 0;
  let developerUnlocked = false;
  let developerResetTimer: number | undefined;
  let developerNoticeTimer: number | undefined;
  let homeGrid: HTMLDivElement | undefined;

  const showDeveloperNotice = (message: string, unlocked = false) => {
    setDeveloperNotice({message, unlocked});
    window.clearTimeout(developerNoticeTimer);
    developerNoticeTimer = window.setTimeout(() => setDeveloperNotice(null), unlocked ? 3200 : 1800);
  };

  const tapDeveloperFooter = () => {
    if (developerUnlocked) {
      showDeveloperNotice("You are already a developer", true);
      return;
    }

    developerTapCount += 1;
    const remainingTaps = 7 - developerTapCount;

    window.clearTimeout(developerResetTimer);
    developerResetTimer = window.setTimeout(() => {
      developerTapCount = 0;
    }, 4000);

    if (remainingTaps === 0) {
      developerUnlocked = true;
      window.clearTimeout(developerResetTimer);
      showDeveloperNotice("You are now a developer", true);
      return;
    }

    if (remainingTaps <= 4) {
      showDeveloperNotice(`You are ${remainingTaps} ${remainingTaps === 1 ? "step" : "steps"} away from being a developer`);
    }
  };

  onMount(() => {
    const listenForSecret = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof Element && target.matches("input, textarea, [contenteditable='true']")) return;

      typedKeys = `${typedKeys}${event.key.toLowerCase()}`.slice(-5);
      if (typedKeys !== "broki") return;

      setSecretVisible(true);
      window.clearTimeout(secretTimer);
      secretTimer = window.setTimeout(() => setSecretVisible(false), 4800);
    };

    window.addEventListener("keydown", listenForSecret);
    onCleanup(() => window.removeEventListener("keydown", listenForSecret));
  });

  onMount(() => {
    const grid = homeGrid;
    const statusCard = grid?.querySelector<HTMLElement>(".status-card");
    if (!grid || !statusCard) return;

    let previousRows = getComputedStyle(grid).gridTemplateRows;
    let rowAnimation: Animation | undefined;
    let isAnimating = false;

    const rowCount = (rows: string) => rows.trim().split(/\s+/).length;
    const syncGridRows = () => {
      if (isAnimating) return;

      const nextRows = getComputedStyle(grid).gridTemplateRows;
      if (nextRows === previousRows) return;

      const fromRows = previousRows;
      previousRows = nextRows;

      const canAnimate = window.matchMedia("(min-width: 821px)").matches
        && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
        && rowCount(fromRows) === rowCount(nextRows);

      if (!canAnimate) return;

      isAnimating = true;
      const animation = grid.animate(
        [
          {gridTemplateRows: fromRows},
          {gridTemplateRows: nextRows},
        ],
        {
          duration: 560,
          easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        },
      );
      rowAnimation = animation;

      animation.onfinish = () => {
        if (rowAnimation !== animation) return;
        rowAnimation = undefined;
        isAnimating = false;
        requestAnimationFrame(syncGridRows);
      };

      animation.oncancel = () => {
        if (rowAnimation !== animation) return;
        rowAnimation = undefined;
        isAnimating = false;
      };
    };

    const observer = new ResizeObserver(syncGridRows);
    observer.observe(statusCard);

    onCleanup(() => {
      observer.disconnect();
      rowAnimation?.cancel();
    });
  });

  onCleanup(() => {
    window.clearTimeout(secretTimer);
    window.clearTimeout(developerResetTimer);
    window.clearTimeout(developerNoticeTimer);
  });

  return (
    <main class="home-page">
      <div ref={homeGrid} class="home-grid page-enter">
        <Hero/>
        <PortraitCard/>
        <StatusCard/>
        <AboutMe/>
        <FeaturedProject/>
      </div>

      <footer class="site-footer">
        <button type="button" class="footer-developer-trigger" onClick={tapDeveloperFooter}>
          <span class="footer-developer-copy">Made with curiosity, SolidJS, and an unreasonable number of rounded corners.</span>
        </button>
      </footer>

      <Transition mode="outin" name="developer-pop">
        <Show when={developerNotice()} keyed>
          {(notice) => (
            <div
              class="developer-toast"
              classList={{"is-unlocked": notice.unlocked}}
              role="status"
              aria-live="polite"
            >
              <span class="developer-toast-icon" aria-hidden="true">
                <Show
                  when={notice.unlocked}
                  fallback={<svg viewBox="0 0 24 24"><path fill="currentColor" d="m8.7 16.6-4.6-4.6 4.6-4.6 1.4 1.4L6.9 12l3.2 3.2-1.4 1.4Zm6.6 0-1.4-1.4 3.2-3.2-3.2-3.2 1.4-1.4 4.6 4.6-4.6 4.6Z"/></svg>}
                >
                  <svg viewBox="0 0 24 24"><path fill="currentColor" d="m9.2 17.2-4.4-4.4 1.4-1.4 3 3 8.6-8.6 1.4 1.4-10 10Z"/></svg>
                </Show>
              </span>
              <strong>{notice.message}</strong>
            </div>
          )}
        </Show>
      </Transition>

      <div class="secret-toast" classList={{"is-visible": secretVisible()}} role="status" aria-live="polite">
        <span class="secret-toast-mark" aria-hidden="true"><i/><i/></span>
        <span class="secret-toast-copy">
          <strong>Nice find.</strong>
          <span>Nothing to collect. Just this.</span>
        </span>
        <button type="button" onClick={() => setSecretVisible(false)} aria-label="Dismiss secret message">×</button>
      </div>
    </main>
  );
};

const Hero = () => {
  const [isFlexShifted, setIsFlexShifted] = createSignal(false);
  let title: HTMLHeadingElement | undefined;
  let pointerFrame: number | undefined;
  let pointerX = 0;
  let pointerY = 0;
  let pointerCard: HTMLElement | undefined;
  let pointerBounds: DOMRect | undefined;

  const updateTitle = () => {
    pointerFrame = undefined;
    if (!pointerCard || !pointerBounds || !title) return;

    const bounds = pointerBounds;
    const horizontal = Math.min(Math.max((pointerX - bounds.left) / bounds.width, 0), 1) * 2 - 1;
    const vertical = Math.min(Math.max((pointerY - bounds.top) / bounds.height, 0), 1) * 2 - 1;
    const horizontalAxis = Math.abs(horizontal) < 0.06 ? 0 : horizontal;
    const shifted = isFlexShifted();
    const width = (shifted ? 88 : 100) + horizontalAxis * (shifted ? 4 : 5);
    const weight = (shifted ? 560 : 690) - vertical * (shifted ? 90 : 70);
    const skew = horizontalAxis * (shifted ? 6 : 4);

    title.style.setProperty("--hero-width", `${width.toFixed(1)}%`);
    title.style.setProperty("--hero-weight", `${Math.round(weight)}`);
    title.style.setProperty("--hero-skew", `${skew.toFixed(2)}deg`);
  };

  const tuneTitle = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    const interactionArea = event.currentTarget as HTMLElement;
    if (pointerCard !== interactionArea) {
      pointerCard = interactionArea;
      pointerBounds = interactionArea.getBoundingClientRect();
    }
    pointerX = event.clientX;
    pointerY = event.clientY;
    pointerFrame ??= requestAnimationFrame(updateTitle);
  };

  const resetTitle = () => {
    window.cancelAnimationFrame(pointerFrame ?? 0);
    pointerFrame = undefined;
    pointerCard = undefined;
    pointerBounds = undefined;
    if (!title) return;
    title.style.removeProperty("--hero-width");
    title.style.removeProperty("--hero-weight");
    title.style.removeProperty("--hero-skew");
  };

  const shiftFlex = (event: MouseEvent) => {
    const target = event.target;
    if (target instanceof Element && target.closest("a, button")) return;

    title?.style.removeProperty("--hero-width");
    title?.style.removeProperty("--hero-weight");
    title?.style.removeProperty("--hero-skew");
    setIsFlexShifted((shifted) => !shifted);
  };

  onCleanup(() => window.cancelAnimationFrame(pointerFrame ?? 0));

  return (
    <section class="expressive-card hero-card" classList={{"is-flex-shifted": isFlexShifted()}}>
      <span class="hero-kicker home-hero-kicker">Independent developer</span>

      <div
        class="hero-title-interaction"
        onPointerMove={tuneTitle}
        onPointerLeave={resetTitle}
        onClick={shiftFlex}
      >
        <h1 ref={title} class="hero-title">
          I make <span>curious</span> little things.
        </h1>
      </div>

      <span class="hero-detail" aria-hidden="true"><i/><i/><i/></span>

      <div class="hero-bottom">
        <p>
          Small digital things made to solve a problem, test an idea, or simply be fun.
        </p>
        <div class="hero-actions">
          <ButtonLink text="Explore projects" url="/projects"/>
          <ButtonLink text="Visit GitHub" url="https://github.com/brokiem" variant="secondary"/>
        </div>
      </div>

      <svg class="hero-doodle" viewBox="0 0 180 96" aria-hidden="true">
        <path d="M9 67c31-47 46 14 78-30 21-29 36 34 83-24"/>
        <path d="m151 12 20 1-4 19"/>
      </svg>
    </section>
  );
};

const PortraitCard = () => {
  const [foundGrass, setFoundGrass] = createSignal(false);
  let tiltFrame: number | undefined;
  let pendingTilt: {card: HTMLButtonElement; x: number; y: number} | undefined;

  const updatePortraitTilt = () => {
    tiltFrame = undefined;
    if (!pendingTilt) return;

    const {card, x: clientX, y: clientY} = pendingTilt;
    const bounds = card.getBoundingClientRect();
    const x = (clientX - bounds.left) / bounds.width - 0.5;
    const y = (clientY - bounds.top) / bounds.height - 0.5;

    card.style.setProperty("--tilt-x", `${y * -2}deg`);
    card.style.setProperty("--tilt-y", `${x * 2.5}deg`);
    card.style.setProperty("--glow-x", `${(x + 0.5) * 100}%`);
    card.style.setProperty("--glow-y", `${(y + 0.5) * 100}%`);
  };

  const tiltPortrait = (event: PointerEvent) => {
    const card = event.currentTarget as HTMLButtonElement;
    pendingTilt = {card, x: event.clientX, y: event.clientY};
    tiltFrame ??= requestAnimationFrame(updatePortraitTilt);
  };

  const resetPortrait = (event: PointerEvent) => {
    const card = event.currentTarget as HTMLButtonElement;
    window.cancelAnimationFrame(tiltFrame ?? 0);
    tiltFrame = undefined;
    pendingTilt = undefined;
    card.style.removeProperty("--tilt-x");
    card.style.removeProperty("--tilt-y");
    card.style.removeProperty("--glow-x");
    card.style.removeProperty("--glow-y");
  };

  onCleanup(() => window.cancelAnimationFrame(tiltFrame ?? 0));

  return (
    <button
      type="button"
      class="portrait-card"
      classList={{"has-found-grass": foundGrass()}}
      onClick={() => setFoundGrass((value) => !value)}
      onPointerMove={tiltPortrait}
      onPointerLeave={resetPortrait}
      aria-pressed={foundGrass()}
      aria-label={foundGrass() ? "Hide the hidden grass message" : "A quiet patch of grass. Activate to investigate"}
    >
      <img src="/brokiem.webp" width="512" height="512" alt=""/>
      <span class="portrait-sheen" aria-hidden="true"/>
      <span class="portrait-label">
        <span aria-hidden="true">↘</span>
        brokiem
      </span>
      <span class="grass-note">
        <strong>Achievement unlocked</strong>
        Grass touched +1
      </span>
    </button>
  );
};

const StatusCard = () => {
  const status = useStore($status);
  const activities = useStore($activityStatuses);
  const activityIds = createMemo(() => activities().map((activity) => activity.activityId));

  return (
    <section class="expressive-card status-card" aria-labelledby="status-heading">
      <div class="card-heading-row">
        <div>
          <span class="card-eyebrow">Live signal</span>
          <h2 id="status-heading">Right now</h2>
        </div>
        <span class="signal-equalizer" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <rect x="3" y="8" width="4" height="8" rx="2"/>
            <rect x="10" y="3" width="4" height="18" rx="2"/>
            <rect x="17" y="6" width="4" height="12" rx="2"/>
          </svg>
        </span>
      </div>

      <div class="status-copy">
        <Show
          when={activities().length > 0}
          fallback={<StatusFallback status={status()}/>}
        >
          <div class="activity-signals">
            <For each={activityIds()}>
              {(activityId) => {
                const activity = createMemo(() => (
                  activities().find((item) => item.activityId === activityId) as ActivityStatus
                ));
                return <ActivitySignal status={activity} tooltipId={`activity-tooltip-${activityId}`}/>;
              }}
            </For>
          </div>
        </Show>
      </div>
    </section>
  );
};

const StatusFallback = ({status}: { status: Status | null }) => {
  if (!status) return <span class="status-loading">Tuning in<span class="loading-dots" aria-hidden="true">...</span></span>;
  if (status.type === "offline") return <span>Touching some grass <span aria-hidden="true">🌾</span></span>;
  return <span>Between adventures <span aria-hidden="true">☕</span></span>;
};

const ActivitySignal = ({status, tooltipId}: { status: Accessor<ActivityStatus>; tooltipId: string }) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [isHovered, setIsHovered] = createSignal(false);
  const [isFocused, setIsFocused] = createSignal(false);
  const isTooltipActive = () => isOpen() || isHovered() || isFocused();

  return (
    <div
      class={`activity-signal activity-signal--${status().activityType}`}
      classList={{"is-open": isOpen()}}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onFocusIn={() => setIsFocused(true)}
      onFocusOut={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsFocused(false);
          setIsOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setIsOpen(false);
          (event.currentTarget.querySelector("button") as HTMLButtonElement | null)?.focus();
        }
      }}
    >
      <button
        type="button"
        class="status-popover-trigger"
        aria-describedby={tooltipId}
        aria-expanded={isOpen()}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span class="activity-signal-icon"><StatusIcon status={status}/></span>
        <span class="activity-signal-copy">
          <small>{status().tooltip.eyebrow}</small>
          <strong>{status().tooltip.title}</strong>
        </span>
        <span class="activity-signal-chevron" aria-hidden="true">›</span>
      </button>
      <ActivityTooltip status={status} id={tooltipId} active={isTooltipActive()}/>
    </div>
  );
};

const StatusIcon = ({status}: { status: Accessor<ActivityStatus> }) => {
  if (status().activityType === 2) return <SpotifyIcon/>;

  return (
    <svg class="status-icon" viewBox="0 0 20 20" aria-hidden="true">
      <path fill="currentColor" d="M7.1 6.1 5.8 3.8H3.2l1.7 3A5.2 5.2 0 0 0 2 11.5V15a2 2 0 0 0 2 2h1.2l1-1.8h7.6l1 1.8H16a2 2 0 0 0 2-2v-3.5a5.2 5.2 0 0 0-2.9-4.7l1.7-3h-2.6l-1.3 2.3A6.8 6.8 0 0 0 10 5.5c-1 0-2 .2-2.9.6ZM6 13.2a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Zm8 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z"/>
    </svg>
  );
};

const ActivityTooltip = (props: { status: Accessor<ActivityStatus>; id: string; active: boolean }) => {
  const {status, id} = props;
  const isListening = () => status().activityType === 2;
  const displayTitle = () => isListening() ? status().tooltip.lines[0] || status().tooltip.title : status().tooltip.title;
  const displayLines = () => isListening() ? status().tooltip.lines.slice(1) : status().tooltip.lines;

  return (
    <div
      id={id}
      class="activity-tooltip"
      classList={{"activity-tooltip--listening": status().activityType === 2}}
      role="tooltip"
    >
      <div class="activity-tooltip-content">
        <div class="activity-tooltip-copy">
          <Show when={status().activityType !== 0}>
            <span class="activity-tooltip-eyebrow">{status().tooltip.eyebrow}</span>
          </Show>
          <span class="activity-tooltip-title">{displayTitle()}</span>
          <For each={displayLines()}>{(line) => <span class="activity-tooltip-line">{line}</span>}</For>
          <Show when={props.active && status().tooltip.progress} keyed>
            {(progress) => <ActivityProgress progress={progress}/>}
          </Show>
        </div>
        <Show when={status().tooltip.visual} keyed fallback={<span class="activity-artwork activity-artwork-empty"/>}>
          {(visual) => <ActivityArtwork visual={visual}/>}
        </Show>
      </div>
    </div>
  );
};

const ActivityArtwork = ({visual}: { visual: NonNullable<ActivityStatus["tooltip"]["visual"]> }) => (
  <span class="activity-artwork" aria-hidden="true">
    <Show
      when={visual.thumbnailUrl}
      keyed
      fallback={<span class="activity-artwork-empty">{visual.iconKind === "spotify" ? <SpotifyIcon inline={false}/> : "✦"}</span>}
    >
      {(thumbnailUrl) => (
        <img src={thumbnailUrl} alt="" width="64" height="64" loading="lazy" decoding="async"/>
      )}
    </Show>
    <Show when={visual.iconUrl || visual.iconKind}>
      <span class="activity-app-icon">
        <Show when={visual.iconUrl} keyed fallback={<SpotifyIcon inline={false}/> }>
          {(iconUrl) => <img src={iconUrl} alt="" width="22" height="22" loading="lazy" decoding="async"/>}
        </Show>
      </span>
    </Show>
  </span>
);

const ActivityProgress = ({progress}: { progress: NonNullable<ActivityStatus["tooltip"]["progress"]> }) => {
  const [now, setNow] = createSignal(Date.now());
  const timer = window.setInterval(() => setNow(Date.now()), 1000);
  onCleanup(() => window.clearInterval(timer));

  const progressInfo = createMemo(() => {
    if (progress.start && progress.end) {
      const duration = Math.max(progress.end - progress.start, 1);
      const elapsed = Math.min(Math.max(now() - progress.start, 0), duration);

      return {
        label: formatDuration(elapsed),
        durationLabel: formatDuration(duration),
        progress: elapsed / duration,
        hasBar: true,
      };
    }

    if (progress.start) {
      return {
        label: `${formatDuration(Math.max(now() - progress.start, 0))} elapsed`,
        durationLabel: null,
        progress: 0,
        hasBar: false,
      };
    }

    if (progress.end) {
      return {
        label: `${formatDuration(Math.max(progress.end - now(), 0))} remaining`,
        durationLabel: null,
        progress: 0,
        hasBar: false,
      };
    }

    return null;
  });

  return (
    <Show when={progressInfo()}>
      {(info) => (
        <span class="activity-progress">
          <span class="activity-progress-time">
            <span>{info().label}</span>
            <Show when={info().durationLabel}>{(duration) => <span>{duration()}</span>}</Show>
          </span>
          <Show when={info().hasBar}>
            <span class="activity-progress-track" aria-hidden="true">
              <WavyProgressIndicator value={info().progress}/>
            </span>
          </Show>
        </span>
      )}
    </Show>
  );
};

const WavyProgressIndicator = (props: { value: number }) => {
  let canvas: HTMLCanvasElement | undefined;
  let frame: number | undefined;
  let drawStillFrame: number | undefined;

  onMount(() => {
    if (!canvas) return;

    const wavelength = 32;
    const waveSpeed = 32;
    const trackGapSize = 6;
    const endStopRadius = 2;
    const strokeWidth = 4;
    const amplitude = 0.62;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const startedAt = performance.now();
    let indicatorColor = "";
    let trackColor = "";
    let stopColor = "";
    let isRtl = false;

    const updateColors = () => {
      if (!canvas) return;
      const styles = getComputedStyle(canvas);
      indicatorColor = styles.color;
      trackColor = styles.borderTopColor;
      stopColor = styles.outlineColor;
      isRtl = styles.direction === "rtl";
    };

    const draw = (timestamp: number) => {
      if (!canvas) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width <= 0 || height <= 0) {
        if (!reducedMotion.matches) frame = requestAnimationFrame(draw);
        return;
      }

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const renderWidth = Math.round(width * pixelRatio);
      const renderHeight = Math.round(height * pixelRatio);
      if (canvas.width !== renderWidth || canvas.height !== renderHeight) {
        canvas.width = renderWidth;
        canvas.height = renderHeight;
      }

      const context = canvas.getContext("2d");
      if (!context) return;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);

      const value = Math.min(Math.max(props.value, 0), 1);
      const maxAmplitude = Math.max(height / 2 - strokeWidth / 2, 0) * amplitude;
      const elapsedSeconds = reducedMotion.matches ? 0 : (timestamp - startedAt) / 1000;
      const phaseOffset = (elapsedSeconds * waveSpeed) % wavelength;
      const logicalX = (x: number) => isRtl ? width - x : x;
      const head = value * width;
      const taperLength = Math.min(wavelength / 2, head);
      const waveY = (x: number) => {
        const taperProgress = taperLength > 0
          ? Math.min(Math.max((head - x) / taperLength, 0), 1)
          : 0;
        const smoothTaper = taperProgress * taperProgress * (3 - 2 * taperProgress);
        return height / 2
          + maxAmplitude * smoothTaper * Math.sin(2 * Math.PI * (x + phaseOffset) / wavelength);
      };
      const wave = new Path2D();
      const steps = Math.min(Math.max(Math.ceil(head / 2), 16), 120);

      for (let index = 0; index <= steps; index += 1) {
        const x = head * index / steps;
        const drawX = logicalX(x);
        const y = waveY(x);
        if (index === 0) wave.moveTo(drawX, y);
        else wave.lineTo(drawX, y);
      }

      context.lineWidth = strokeWidth;
      context.lineCap = "round";
      context.lineJoin = "round";
      const trackStart = value <= 0 ? 0 : Math.min(width, head + trackGapSize);

      if (trackStart < width) {
        const trackEnd = width - endStopRadius;
        context.beginPath();
        context.moveTo(logicalX(trackStart), height / 2);
        context.lineTo(logicalX(trackEnd), height / 2);
        context.strokeStyle = trackColor;
        context.stroke();

        context.beginPath();
        context.arc(logicalX(trackEnd), height / 2, endStopRadius, 0, Math.PI * 2);
        context.fillStyle = stopColor;
        context.fill();
      }

      if (value > 0) {
        context.strokeStyle = indicatorColor;
        context.stroke(wave);
      }

      if (!reducedMotion.matches) frame = requestAnimationFrame(draw);
    };

    const requestStillDraw = () => {
      if (!reducedMotion.matches) return;
      window.cancelAnimationFrame(drawStillFrame ?? 0);
      drawStillFrame = requestAnimationFrame(draw);
    };

    updateColors();
    const resizeObserver = new ResizeObserver(requestStillDraw);
    resizeObserver.observe(canvas);
    const themeObserver = new MutationObserver(() => {
      updateColors();
      requestStillDraw();
    });
    themeObserver.observe(document.documentElement, {attributes: true, attributeFilter: ["data-mood"]});

    const handleMotionChange = () => {
      window.cancelAnimationFrame(frame ?? 0);
      if (reducedMotion.matches) requestStillDraw();
      else frame = requestAnimationFrame(draw);
    };
    reducedMotion.addEventListener("change", handleMotionChange);
    handleMotionChange();

    createEffect(() => {
      void props.value;
      requestStillDraw();
    });

    onCleanup(() => {
      resizeObserver.disconnect();
      themeObserver.disconnect();
      reducedMotion.removeEventListener("change", handleMotionChange);
      window.cancelAnimationFrame(frame ?? 0);
      window.cancelAnimationFrame(drawStillFrame ?? 0);
    });
  });

  return <canvas ref={canvas} class="activity-progress-canvas"/>;
};

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const SpotifyIcon = ({inline = true}: { inline?: boolean }) => (
  <svg viewBox="0 0 496 512" class="spotify-icon" classList={{"is-inline": inline}} aria-hidden="true">
    <path fill="currentColor" d="M248 8a248 248 0 1 0 0 496 248 248 0 0 0 0-496Zm101 365c-5 0-7-1-11-4-62-37-135-39-207-24l-12 2c-9 0-15-7-15-15 0-11 6-16 13-17 82-18 166-17 237 26 6 4 10 7 10 16s-7 16-15 16Zm27-66c-6 0-9-2-13-4-62-37-155-52-238-29l-12 2c-11 0-20-8-20-19s6-18 16-21c28-8 56-13 98-13 65 0 127 16 177 45 8 5 11 11 11 20 0 11-9 19-19 19Zm31-76c-6 0-9-1-13-4-72-42-199-53-281-30-4 1-8 3-13 3-13 0-23-10-23-24 0-13 8-21 17-23 35-11 75-16 118-16 73 0 149 16 205 48 8 5 13 11 13 23 0 13-11 23-23 23Z"/>
  </svg>
);

const AboutMe = () => (
  <article class="expressive-card about-card">
    <div class="about-title-lockup">
      <h2>Curiosity has terrible boundaries.</h2>
      <span class="about-quote-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path fill="currentColor" d="M5 17h4l2-4V7H5v6h3l-3 4Zm8 0h4l2-4V7h-6v6h3l-3 4Z"/>
        </svg>
      </span>
    </div>
    <div class="about-note">
      <p>
        Mostly web. Sometimes desktop, occasionally a game—whatever’s worth losing an evening to.
      </p>
    </div>
  </article>
);

const FeaturedProject = () => {
  const featuredProject = useStore($featuredProject);
  const isLoading = useStore($isLoading);

  return (
    <section class="expressive-card latest-card" aria-labelledby="featured-heading">
      <div class="latest-copy">
        <span class="card-eyebrow" id="featured-heading">Featured project</span>

        <Transition mode="outin" name="slide-fade">
          <Show
            when={!isLoading()}
            fallback={<span class="latest-project-skeleton" aria-label="Loading latest project"/>}
          >
            <Show
              when={featuredProject()}
              keyed
              fallback={<p>Something new is still taking shape.</p>}
            >
              {(project) => (
                <div class="latest-project-details">
                  <h3>{project.name}</h3>
                  <p>{project.desc || project.stack}</p>
                  <a class="latest-link" href={project.url || project.github || "/#/projects"}>
                    Take a look
                  </a>
                </div>
              )}
            </Show>
          </Show>
        </Transition>
      </div>

      <div class="latest-visual" aria-hidden="true">
        <ProjectIllustration
          name={featuredProject()?.name || "Featured"}
          variant={(featuredProject()?.name.length || 0) % 4}
        />
      </div>
    </section>
  );
};

export default MainPage;

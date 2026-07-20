import {createEffect, onCleanup, onMount} from "solid-js";

export function WavyProgress(props: {value: number}) {
  let canvas: HTMLCanvasElement | undefined;

  onMount(() => {
    if (!canvas) return;
    const target = canvas;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const wavelength = 32;
    const speed = 32;
    const stroke = 4;
    const amplitudeRatio = 0.62;
    const gap = 6;
    const endRadius = 2;
    let frame = 0;
    let startedAt = performance.now();
    let width = 0;
    let height = 0;
    let ratio = 1;
    let indicatorColor = "";
    let trackColor = "";
    let stopColor = "";
    let rtl = false;

    const measure = () => {
      width = target.clientWidth;
      height = target.clientHeight;
      ratio = Math.min(devicePixelRatio || 1, 2);
      const renderWidth = Math.round(width * ratio);
      const renderHeight = Math.round(height * ratio);
      if (target.width !== renderWidth || target.height !== renderHeight) {
        target.width = renderWidth;
        target.height = renderHeight;
      }
      const style = getComputedStyle(target);
      indicatorColor = style.color;
      trackColor = style.borderTopColor;
      stopColor = style.outlineColor;
      rtl = style.direction === "rtl";
    };

    const draw = (timestamp: number) => {
      if (width <= 0 || height <= 0) measure();
      const context = target.getContext("2d");
      if (!context || width <= 0 || height <= 0) return;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      const value = Math.min(Math.max(props.value, 0), 1);
      const head = value * width;
      const phase = reducedMotion.matches ? 0 : ((timestamp - startedAt) / 1000 * speed) % wavelength;
      const maxAmplitude = Math.max(height / 2 - stroke / 2, 0) * amplitudeRatio;
      const taperLength = Math.min(wavelength / 2, head);
      const logicalX = (x: number) => rtl ? width - x : x;

      context.lineWidth = stroke;
      context.lineCap = "round";
      context.lineJoin = "round";

      const trackStart = value <= 0 ? 0 : Math.min(width, head + gap);
      if (trackStart < width) {
        const trackEnd = width - endRadius;
        context.beginPath();
        context.moveTo(logicalX(trackStart), height / 2);
        context.lineTo(logicalX(trackEnd), height / 2);
        context.strokeStyle = trackColor;
        context.stroke();
        context.beginPath();
        context.arc(logicalX(trackEnd), height / 2, endRadius, 0, Math.PI * 2);
        context.fillStyle = stopColor;
        context.fill();
      }

      if (head > 0) {
        const steps = Math.min(Math.max(Math.ceil(head / 3), 14), 96);
        context.beginPath();
        for (let index = 0; index <= steps; index += 1) {
          const x = head * index / steps;
          const taper = taperLength > 0 ? Math.min(Math.max((head - x) / taperLength, 0), 1) : 0;
          const easedTaper = taper * taper * (3 - 2 * taper);
          const y = height / 2 + maxAmplitude * easedTaper * Math.sin(2 * Math.PI * (x + phase) / wavelength);
          if (index === 0) context.moveTo(logicalX(x), y);
          else context.lineTo(logicalX(x), y);
        }
        context.strokeStyle = indicatorColor;
        context.stroke();
      }

      if (!reducedMotion.matches) frame = requestAnimationFrame(draw);
    };

    const requestDraw = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };
    const resize = new ResizeObserver(() => { measure(); requestDraw(); });
    const theme = new MutationObserver(() => { measure(); requestDraw(); });
    const motionChange = () => {
      startedAt = performance.now();
      requestDraw();
    };

    measure();
    resize.observe(target);
    theme.observe(document.documentElement, {attributes: true, attributeFilter: ["data-mood"]});
    reducedMotion.addEventListener("change", motionChange);
    createEffect(() => { void props.value; if (reducedMotion.matches) requestDraw(); });
    requestDraw();

    onCleanup(() => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      theme.disconnect();
      reducedMotion.removeEventListener("change", motionChange);
    });
  });

  return <canvas ref={canvas} class="activity-progress-canvas"/>;
}

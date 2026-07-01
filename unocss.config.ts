import {defineConfig} from '@unocss/vite';
import presetWind from "@unocss/preset-wind";
import presetAttributify from '@unocss/preset-attributify';

export default defineConfig({
  presets: [
    presetWind(),
    presetAttributify()
  ],
  shortcuts: {
    "slide-up": "animate-[slide-up_360ms_cubic-bezier(0.2,0,0,1)_1_both] [will-change:opacity,transform]",
    "dot": "inline-block opacity-20 animate-[dot-blink_1s_infinite]",
    "dot-1": "[animation-delay:0.1s]",
    "dot-2": "[animation-delay:0.2s]",
    "dot-3": "[animation-delay:0.3s]",
    "status-popover-trigger": "relative inline-flex items-center rounded-full cursor-default outline-none focus-visible:outline-2 focus-visible:outline-[var(--md-sys-color-primary)] focus-visible:outline-offset-3",
    "activity-tooltip": "absolute top-[calc(100%+0.625rem)] left-1/2 z-20 flex w-max min-w-[18rem] max-w-[min(22rem,calc(100vw-2rem))] flex-col gap-[0.125rem] px-4 py-3 text-[var(--md-sys-color-on-surface)] bg-[var(--md-sys-color-surface-container-highest)] rounded-lg shadow-[0_1px_2px_rgba(10,6,5,0.3),0_2px_6px_2px_rgba(10,6,5,0.15)] opacity-0 pointer-events-none invisible translate-x-[-50%] translate-y-[-0.5rem] scale-[0.96] origin-top transition-[opacity,transform,visibility] duration-[180ms] ease-[cubic-bezier(0.05,0.7,0.1,1)] group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:scale-100 group-focus-visible:opacity-100 group-focus-visible:visible group-focus-visible:translate-y-0 group-focus-visible:scale-100 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:scale-100",
    "activity-tooltip-content": "flex items-center gap-3 min-w-0",
    "activity-tooltip-copy": "flex min-w-0 flex-1 flex-col gap-[0.125rem]",
    "activity-tooltip-title": "mt-[0.125rem] text-[0.875rem] text-[var(--md-sys-color-on-surface)] font-700 leading-5",
    "activity-tooltip-line": "text-[0.75rem] text-[var(--md-sys-color-on-surface-variant)] font-400 leading-4",
    "activity-artwork": "relative grid h-14 w-14 flex-none place-items-center overflow-visible rounded-xl bg-[rgba(235,194,180,0.12)]",
    "activity-artwork-image": "h-14 w-14 rounded-xl object-cover",
    "activity-artwork-empty": "grid h-14 w-14 place-items-center rounded-xl bg-[rgba(235,194,180,0.14)] [&>svg]:h-7 [&>svg]:w-7",
    "activity-app-icon": "absolute -right-1 -bottom-1 grid h-6 w-6 place-items-center overflow-hidden rounded-full border-2 border-[var(--md-sys-color-surface-container-highest)] bg-[#1f1715] shadow-[0_1px_2px_rgba(10,6,5,0.32)] [&>img]:h-5 [&>img]:w-5 [&>img]:object-cover [&>svg]:h-5 [&>svg]:w-5",
    "activity-progress": "mt-[0.375rem] flex flex-col gap-[0.3125rem]",
    "activity-progress-time": "text-[0.6875rem] text-[var(--md-sys-color-on-surface-variant)] font-500 leading-4",
    "activity-progress-track": "relative h-1 overflow-hidden rounded-full bg-[rgba(235,194,180,0.24)]",
    "activity-progress-fill": "absolute inset-y-0 left-0 rounded-inherit bg-[var(--md-sys-color-primary)] transition-width duration-[450ms] ease-[cubic-bezier(0.2,0,0,1)]",
    "activity-other-list": "mt-2 flex flex-col gap-[0.375rem] border-t border-[rgba(235,194,180,0.18)] pt-2",
    "activity-other-item": "flex min-w-0 items-center gap-[0.625rem]",
    "activity-other-artwork": "grid h-6 w-6 flex-none place-items-center overflow-hidden rounded-[0.375rem] bg-[rgba(235,194,180,0.1)] [&>img]:h-6 [&>img]:w-6 [&>img]:object-cover [&>svg]:h-6 [&>svg]:w-6",
    "activity-other-placeholder": "grid h-6 w-6 flex-none place-items-center overflow-hidden rounded-[0.375rem] bg-[rgba(235,194,180,0.1)]",
    "activity-other-copy": "flex min-w-0 flex-1 flex-col",
    "activity-other-title": "overflow-hidden text-ellipsis whitespace-nowrap text-[0.75rem] text-[var(--md-sys-color-on-surface)] font-600 leading-4",
    "activity-other-detail": "overflow-hidden text-ellipsis whitespace-nowrap text-[0.6875rem] text-[var(--md-sys-color-on-surface-variant)] font-400 leading-4",
    "project-card": "[content-visibility:auto] [contain:layout_paint_style] [contain-intrinsic-size:auto_14.5rem]",
  },
});

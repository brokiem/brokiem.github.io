import {createSignal, onCleanup, onMount} from "solid-js";

export function SecretDiscovery() {
  const [visible, setVisible] = createSignal(false);
  let typed = "";
  let timer = 0;

  onMount(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.target instanceof Element && event.target.matches("input, textarea, [contenteditable='true']")) return;
      typed = `${typed}${event.key.toLowerCase()}`.slice(-5);
      if (typed !== "broki") return;
      setVisible(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setVisible(false), 4800);
    };
    window.addEventListener("keydown", keydown);
    onCleanup(() => window.removeEventListener("keydown", keydown));
  });
  onCleanup(() => window.clearTimeout(timer));

  return (
    <div class="secret-toast" classList={{"is-visible": visible()}} role="status" aria-live="polite">
      <span class="secret-toast-mark" aria-hidden="true"><i/><i/></span>
      <span class="secret-toast-copy"><strong>Nice find.</strong><span>Nothing to collect. Just this.</span></span>
      <button type="button" onClick={() => setVisible(false)} aria-label="Dismiss secret message" data-ripple>×</button>
    </div>
  );
}

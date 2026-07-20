import {createSignal, For, onCleanup, onMount} from "solid-js";
import {ActionLink} from "../ui/ActionLink";

const WORKBENCH_TITLE = "There’s a small ritual behind the little things.";
const SCRAMBLE_CHARACTERS = "abcdefghiklmnorstuvxyz?+*";
const SCRAMBLE_LEAD_IN = 180;
const SCRAMBLE_RESOLVE_DURATION = 820;
const GLYPH_SETTLE_DURATION = 180;
const WORKBENCH_TITLE_CHARACTERS = Array.from(WORKBENCH_TITLE, (character) => ({
  character,
  canScramble: /[a-z]/i.test(character),
  isUppercase: character === character.toUpperCase(),
}));
const WORKBENCH_TITLE_WORDS = (() => {
  let start = 0;
  return WORKBENCH_TITLE.split(" ").map((word) => {
    const titleWord = {word, start};
    start += word.length + 1;
    return titleWord;
  });
})();

const stages = [
  {
    label: "Notice",
    title: "Find the little snag.",
    copy: "A repeated annoyance, a strange constraint, or a question that refuses to leave is usually enough to begin.",
  },
  {
    label: "Make",
    title: "Give the idea edges.",
    copy: "The first version stays deliberately small. Real pixels make vague ideas honest—and much easier to improve.",
  },
  {
    label: "Keep",
    title: "Save the useful spark.",
    copy: "Polish what matters, leave one delightful surprise, and ship before the idea becomes permanent furniture.",
  },
] as const;

const principles = [
  "Fast enough to feel obvious",
  "Clear enough to explore",
  "Small enough to finish",
  "Odd enough to remember",
] as const;

export function WorkbenchSection() {
  const [activeStage, setActiveStage] = createSignal(0);
  const [scrambledTitle, setScrambledTitle] = createSignal(WORKBENCH_TITLE);
  const [isScrambling, setIsScrambling] = createSignal(false);
  let title: HTMLHeadingElement | undefined;
  let scrambleFrame: number | undefined;
  let settleTimer: number | undefined;
  let titleObserver: IntersectionObserver | undefined;

  const playTitleScramble = () => {
    if (scrambleFrame !== undefined || settleTimer !== undefined || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const startedAt = performance.now();
    let previousShuffleStep = -1;
    let previousResolveIndex = -2;
    setIsScrambling(true);

    const tick = (now: number) => {
      const elapsed = now - startedAt;
      const resolveProgress = Math.min(Math.max((elapsed - SCRAMBLE_LEAD_IN) / SCRAMBLE_RESOLVE_DURATION, 0), 1);
      const resolveIndex = Math.floor(resolveProgress * WORKBENCH_TITLE.length) - 1;
      const shuffleStep = Math.floor(elapsed / 56);
      const shouldShuffle = shuffleStep !== previousShuffleStep;
      const shouldResolve = resolveIndex !== previousResolveIndex;
      const leadInStrength = Math.min(elapsed / SCRAMBLE_LEAD_IN, 1);

      if (shouldShuffle || shouldResolve) {
        previousShuffleStep = shuffleStep;
        previousResolveIndex = resolveIndex;
        setScrambledTitle((currentTitle) => WORKBENCH_TITLE_CHARACTERS.map(({character, canScramble, isUppercase}, index) => {
          if (index <= resolveIndex || !canScramble) return character;
          if (!shouldShuffle) return currentTitle[index] ?? character;
          if (resolveProgress === 0 && Math.random() > leadInStrength) return character;
          const replacement = SCRAMBLE_CHARACTERS[Math.floor(Math.random() * SCRAMBLE_CHARACTERS.length)] ?? "x";
          return isUppercase ? replacement.toUpperCase() : replacement;
        }).join(""));
      }

      if (resolveProgress < 1) {
        scrambleFrame = requestAnimationFrame(tick);
        return;
      }

      scrambleFrame = undefined;
      setScrambledTitle(WORKBENCH_TITLE);
      settleTimer = window.setTimeout(() => {
        settleTimer = undefined;
        setIsScrambling(false);
      }, GLYPH_SETTLE_DURATION);
    };

    scrambleFrame = requestAnimationFrame(tick);
  };

  onMount(() => {
    if (!title || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    titleObserver = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      titleObserver?.disconnect();
      titleObserver = undefined;
      playTitleScramble();
    }, {threshold: 0.55});
    titleObserver.observe(title);
  });

  onCleanup(() => {
    titleObserver?.disconnect();
    if (scrambleFrame !== undefined) cancelAnimationFrame(scrambleFrame);
    if (settleTimer !== undefined) window.clearTimeout(settleTimer);
  });

  return (
    <section class="workbench-section" aria-labelledby="workbench-title">
      <header class="workbench-heading">
        <div>
          <span class="workbench-eyebrow">Behind the pixels</span>
          <h2
            ref={title}
            id="workbench-title"
            classList={{"is-scrambling": isScrambling()}}
          >
            <For each={WORKBENCH_TITLE_WORDS}>
              {(titleWord, index) => (
                <>
                  <span class="workbench-title-word">
                    <span class="workbench-title-word-original">{titleWord.word}</span>
                    <span class="workbench-title-word-scramble" aria-hidden="true">
                      {scrambledTitle().slice(titleWord.start, titleWord.start + titleWord.word.length)}
                    </span>
                  </span>
                  {index() < WORKBENCH_TITLE_WORDS.length - 1 ? " " : null}
                </>
              )}
            </For>
          </h2>
        </div>
        <p>I rarely begin with a grand plan. It is usually one loose thread, pulled just far enough to become something useful.</p>
      </header>

      <div class={`workbench-stages is-stage-${activeStage()}`} aria-label="How ideas become projects">
        <For each={stages}>
          {(stage, index) => (
            <button
              type="button"
              class={`workbench-stage workbench-stage--${index() + 1}`}
              classList={{"is-active": activeStage() === index()}}
              aria-pressed={activeStage() === index()}
              onClick={() => setActiveStage(index())}
              data-ripple
            >
              <span class="workbench-stage-number" aria-hidden="true">0{index() + 1}</span>
              <span class="workbench-stage-label">{stage.label}</span>
              <span class="workbench-stage-copy">
                <strong>{stage.title}</strong>
                <small>{stage.copy}</small>
              </span>
              <span class={`workbench-stage-visual workbench-stage-visual--${index() + 1}`} aria-hidden="true">
                <i/><i/><i/>
              </span>
            </button>
          )}
        </For>
      </div>

      <footer class="workbench-footer">
        <div class="workbench-principles" aria-label="Design principles">
          <For each={principles}>{(principle) => <span>{principle}</span>}</For>
        </div>
        <ActionLink href="/projects" hideChevron={true}>See what made it out</ActionLink>
      </footer>
    </section>
  );
}

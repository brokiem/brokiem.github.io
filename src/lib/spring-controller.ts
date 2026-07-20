type SpringOptions = {
  stiffness: number;
  damping: number;
  mass?: number;
  restDelta?: number;
  restSpeed?: number;
};

export class SpringController<Key extends string> {
  #current: Record<Key, number>;
  #damping: number;
  #frame = 0;
  #keys: Key[];
  #lastTime = 0;
  #mass: number;
  #onUpdate: (values: Readonly<Record<Key, number>>) => void;
  #restDelta: number;
  #restSpeed: number;
  #stiffness: number;
  #target: Record<Key, number>;
  #velocity: Record<Key, number>;

  constructor(initial: Record<Key, number>, options: SpringOptions, onUpdate: (values: Readonly<Record<Key, number>>) => void) {
    this.#keys = Object.keys(initial) as Key[];
    this.#current = {...initial};
    this.#target = {...initial};
    this.#velocity = Object.fromEntries(this.#keys.map((key) => [key, 0])) as Record<Key, number>;
    this.#stiffness = options.stiffness;
    this.#damping = options.damping;
    this.#mass = options.mass ?? 1;
    this.#restDelta = options.restDelta ?? 0.01;
    this.#restSpeed = options.restSpeed ?? 0.01;
    this.#onUpdate = onUpdate;
    this.#onUpdate(this.#current);
  }

  set(values: Partial<Record<Key, number>>) {
    Object.assign(this.#target, values);
    if (!this.#frame) {
      this.#lastTime = performance.now();
      this.#frame = requestAnimationFrame(this.#tick);
    }
  }

  jump(values: Partial<Record<Key, number>>) {
    Object.assign(this.#target, values);
    Object.assign(this.#current, values);
    for (const key of this.#keys) this.#velocity[key] = 0;
    cancelAnimationFrame(this.#frame);
    this.#frame = 0;
    this.#onUpdate(this.#current);
  }

  destroy() {
    cancelAnimationFrame(this.#frame);
    this.#frame = 0;
  }

  #tick = (time: number) => {
    const delta = Math.min((time - this.#lastTime) / 1000, 0.032);
    const decay = Math.exp(-this.#damping * delta / this.#mass);
    let settled = true;

    for (const key of this.#keys) {
      const displacement = this.#target[key] - this.#current[key];
      const acceleration = displacement * this.#stiffness / this.#mass;
      const velocity = (this.#velocity[key] + acceleration * delta) * decay;
      this.#velocity[key] = velocity;
      this.#current[key] += velocity * delta;
      if (Math.abs(displacement) > this.#restDelta || Math.abs(velocity) > this.#restSpeed) settled = false;
    }

    this.#lastTime = time;
    this.#onUpdate(this.#current);
    if (settled) {
      Object.assign(this.#current, this.#target);
      this.#onUpdate(this.#current);
      this.#frame = 0;
      return;
    }
    this.#frame = requestAnimationFrame(this.#tick);
  };
}

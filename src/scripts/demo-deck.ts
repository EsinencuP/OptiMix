type DeckCard = {
  element: HTMLElement;
  front: HTMLElement;
  back: HTMLElement;
  hit: HTMLButtonElement;
  details: HTMLElement[];
};

let cleanup: (() => void) | undefined;

function setupDeck(root: HTMLElement): () => void {
  const cards = [...root.querySelectorAll<HTMLElement>('[data-deck-card]')]
    .map((element): DeckCard | undefined => {
      const front = element.querySelector<HTMLElement>('.ox-deck-front');
      const back = element.querySelector<HTMLElement>('.ox-deck-back');
      const hit = element.querySelector<HTMLButtonElement>('[data-deck-hit]');
      if (!front || !back || !hit) return undefined;
      return { element, front, back, hit, details: [...element.querySelectorAll<HTMLElement>('[data-deck-detail]')] };
    })
    .filter((card): card is DeckCard => Boolean(card));
  if (!cards.length) return () => {};

  const controller = new AbortController();
  const options = { signal: controller.signal };
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
  const revealControls = [...root.querySelectorAll<HTMLButtonElement>('[data-deck-reveal]')];
  const selectors = [...root.querySelectorAll<HTMLButtonElement>('[data-deck-select]')];
  const originalVisibility = new Map<HTMLElement, { hidden: HTMLElement['hidden']; inert: boolean; ariaHidden: string | null }>();
  let selected: DeckCard | undefined;
  let flipped = false;
  let pointerInside = false;
  let focusInside = root.contains(document.activeElement);

  const show = (element: HTMLElement, visible: boolean, hide = true) => {
    if (!originalVisibility.has(element)) {
      originalVisibility.set(element, { hidden: element.hidden, inert: element.inert, ariaHidden: element.getAttribute('aria-hidden') });
    }
    // Faces stay rendered so their shared 3D container can rotate smoothly.
    if (hide) element.hidden = !visible;
    element.inert = !visible;
    element.setAttribute('aria-hidden', String(!visible));
  };

  const render = () => {
    const expanded = pointerInside || focusInside || Boolean(selected);
    root.classList.toggle('is-expanded', expanded);
    root.classList.toggle('has-open-card', Boolean(selected));
    revealControls.forEach((control) => {
      control.setAttribute('aria-expanded', String(expanded));
      show(control, !expanded);
    });
    selectors.forEach((control) => control.setAttribute('aria-pressed', String(control.dataset.deckSelect === selected?.element.dataset.deckCard)));
    cards.forEach((card) => {
      const open = selected === card;
      const reverse = open && flipped;
      card.element.classList.toggle('is-open', open);
      card.element.classList.toggle('is-flipped', reverse);
      card.hit.setAttribute('aria-expanded', String(open));
      card.hit.setAttribute('aria-label', (open ? card.hit.dataset.deckFlipLabel : card.hit.dataset.deckOpenLabel) || '');
      show(card.front, !reverse, false);
      show(card.back, reverse, false);
      show(card.hit, !reverse, false);
      card.details.forEach((detail) => show(detail, open));
      card.element.querySelectorAll<HTMLElement>('[data-deck-close], [data-deck-flip], [data-deck-back]').forEach((control) => {
        // Controls outside a detail wrapper still belong only to an open card.
        show(control, open);
        if (control.hasAttribute('data-deck-flip')) control.setAttribute('aria-pressed', String(reverse));
      });
    });
  };

  const close = (restoreFocus = true) => {
    const previous = selected;
    selected = undefined;
    flipped = false;
    render();
    if (restoreFocus) previous?.hit.focus({ preventScroll: true });
  };

  const turn = (reverse: boolean) => {
    if (!selected) return;
    const oldFace = flipped ? selected.back : selected.front;
    const focusWasOnOldFace = oldFace.contains(document.activeElement) || document.activeElement === selected.hit;
    flipped = reverse;
    render();
    if (focusWasOnOldFace) {
      const target = reverse
        ? selected.back.querySelector<HTMLButtonElement>('[data-deck-back], [data-deck-close], [data-deck-flip]')
        : selected.hit;
      target?.focus({ preventScroll: true });
    }
  };

  const activate = (card: DeckCard) => {
    if (selected === card) {
      turn(!flipped);
      return;
    }
    selected = card;
    flipped = false;
    render();
  };

  const click = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;
    const target = event.target;
    if (target.closest('[data-deck-reveal]')) {
      cards[Math.floor(cards.length / 2)].hit.focus({ preventScroll: true });
      return;
    }
    const selector = target.closest<HTMLElement>('[data-deck-select]');
    if (selector) {
      const requested = cards.find((item) => item.element.dataset.deckCard === selector.dataset.deckSelect);
      if (requested && requested !== selected) activate(requested);
      return;
    }
    const cardElement = target.closest<HTMLElement>('[data-deck-card]');
    const card = cards.find((item) => item.element === cardElement);
    if (target.closest('[data-deck-close]')) {
      close();
      return;
    }
    if (target.closest('[data-deck-back]')) {
      turn(false);
      return;
    }
    if (target.closest('[data-deck-flip]')) {
      turn(!flipped);
      return;
    }
    if (card && target.closest('[data-deck-hit]')) {
      activate(card);
      return;
    }
    // A demo/project link navigates normally, including when its child icon is clicked.
    if (target.closest('a, button, input, select, textarea, summary, [role="button"], [contenteditable="true"]')) return;
    if (card) activate(card);
  };

  root.addEventListener('click', click, options);
  root.addEventListener('pointerenter', (event) => {
    if (!hover.matches || event.pointerType === 'touch') return;
    pointerInside = true;
    render();
  }, options);
  root.addEventListener('pointerleave', () => {
    pointerInside = false;
    render();
  }, options);
  root.addEventListener('focusin', (event) => {
    focusInside = true;
    render();
    // Expanding removes the cover; carry its keyboard focus onto a real card.
    if (event.target instanceof Element && event.target.closest('[data-deck-reveal]')) {
      cards[Math.floor(cards.length / 2)].hit.focus({ preventScroll: true });
    }
  }, options);
  root.addEventListener('focusout', () => {
    // Focus may be moving between cards, or to the newly visible reverse face.
    queueMicrotask(() => {
      if (controller.signal.aborted) return;
      focusInside = root.contains(document.activeElement);
      render();
    });
  }, options);
  root.addEventListener('keydown', (event) => {
    if (!(event.target instanceof Element)) return;
    const hit = event.target.closest('[data-deck-hit]');
    const index = cards.findIndex((card) => card.hit === hit);
    if (index < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const focusable = cards.filter((card) => card !== selected || !flipped);
    const current = focusable.findIndex((card) => card.hit === hit);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? focusable.length - 1
      : (current + (event.key === 'ArrowRight' ? 1 : -1) + focusable.length) % focusable.length;
    focusable[next]?.hit.focus({ preventScroll: true });
  }, options);
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !selected) return;
    event.preventDefault();
    close();
  }, options);
  document.addEventListener('click', (event) => {
    if (selected && event.target instanceof Node && !root.contains(event.target)) close(false);
  }, options);
  hover.addEventListener('change', () => {
    if (!hover.matches) pointerInside = false;
    render();
  }, options);

  root.classList.add('is-ready');
  render();
  return () => {
    controller.abort();
    root.classList.remove('is-ready', 'is-expanded', 'has-open-card');
    cards.forEach((card) => {
      card.element.classList.remove('is-open', 'is-flipped');
      card.hit.setAttribute('aria-expanded', 'false');
      card.hit.setAttribute('aria-label', card.hit.dataset.deckOpenLabel || '');
    });
    selectors.forEach((control) => control.setAttribute('aria-pressed', 'false'));
    originalVisibility.forEach((original, element) => {
      element.hidden = original.hidden;
      element.inert = original.inert;
      if (original.ariaHidden === null) element.removeAttribute('aria-hidden');
      else element.setAttribute('aria-hidden', original.ariaHidden);
    });
  };
}

function initDecks() {
  cleanup?.();
  const disposers = [...document.querySelectorAll<HTMLElement>('[data-demo-deck]')].map(setupDeck);
  cleanup = () => disposers.forEach((dispose) => dispose());
}

initDecks();
document.addEventListener('astro:page-load', initDecks);
document.addEventListener('astro:before-swap', () => { cleanup?.(); cleanup = undefined; });

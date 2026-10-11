import { useEffect } from "react";

const SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const DIRS: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};

function visible(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return false;
  const s = getComputedStyle(el);
  return s.visibility !== "hidden" && s.display !== "none";
}

function firstFocusable(): HTMLElement | null {
  const ok = (el: HTMLElement) => visible(el) && el.tagName !== "INPUT" && el.tagName !== "SELECT";
  const main = document.querySelector("main");
  const inMain = main ? Array.from(main.querySelectorAll<HTMLElement>(SELECTOR)).find(ok) : null;
  return inMain ?? Array.from(document.querySelectorAll<HTMLElement>(SELECTOR)).find(ok) ?? null;
}

function focusElement(el: HTMLElement) {
  if (isTextInput(el) && !el.readOnly) {
    el.readOnly = true;
    el.dataset["remoteLock"] = "1";
  }
  el.focus({ preventScroll: true });
  el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "auto" });
}

function isTextInput(el: Element | null): el is HTMLInputElement {
  return el instanceof HTMLInputElement && !["checkbox", "radio", "button", "submit", "range"].includes(el.type);
}

/** Fast spatial D-pad navigation for TV remotes. */
export function useRemoteNavigation() {
  useEffect(() => {
    // Give the remote something to control right away.
    const t = window.setTimeout(() => {
      const a = document.activeElement;
      if (!a || a === document.body) {
        const first = firstFocusable();
        if (first) focusElement(first);
      }
    }, 400);

    // Keyboard only opens when the user presses OK (or taps) on a text field.
    let tapped: Element | null = null;
    const onPointer = (e: PointerEvent) => { tapped = e.target as Element; };
    const onFocusIn = (e: FocusEvent) => {
      const el = e.target as Element;
      if (isTextInput(el) && tapped !== el) {
        el.readOnly = true;
        el.dataset["remoteLock"] = "1";
      }
      tapped = null;
    };
    const onFocusOut = (e: FocusEvent) => {
      const el = e.target as Element;
      if (isTextInput(el)) {
        if (el.dataset["remoteLock"]) { el.readOnly = false; delete el.dataset["remoteLock"]; }
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const act = document.activeElement;
      if (isTextInput(act) && act.dataset["remoteLock"] && ["Enter", "NumpadEnter", "Select"].includes(e.key)) {
        e.preventDefault();
        act.readOnly = false;
        delete act.dataset["remoteLock"];
        act.blur();
        tapped = act;
        act.focus();
        return;
      }
      if (e.key === "Select" && act instanceof HTMLElement && act.matches('button, a[href]')) {
        e.preventDefault();
        act.click();
        return;
      }
      // Back keys
      if (e.key === "GoBack" || e.key === "BrowserBack" || (e.key === "Backspace" && !(isTextInput(act) && !act.readOnly))) {
        e.preventDefault();
        window.history.back();
        return;
      }

      const dir = DIRS[e.key];
      if (!dir) return;
      const active = document.activeElement as HTMLElement | null;
      if (active?.tagName === "VIDEO") return;
      if (isTextInput(active) && !active.readOnly && dir[0] !== 0) {
        const inp = active as HTMLInputElement;
        const pos = inp.selectionStart ?? 0;
        const atEdge = dir[0] < 0 ? pos === 0 : pos === inp.value.length;
        if (!atEdge) return;
      }

      if (!active || active === document.body) {
        e.preventDefault();
        const first = firstFocusable();
        if (first) focusElement(first);
        return;
      }

      const a = active.getBoundingClientRect();
      const ax = a.left + a.width / 2;
      const ay = a.top + a.height / 2;
      let best: HTMLElement | null = null;
      let bestScore = Infinity;
      const els = document.querySelectorAll<HTMLElement>(SELECTOR);
      for (const el of els) {
        if (el === active || !visible(el) || el.closest('[inert], [aria-hidden="true"]')) continue;
        const r = el.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) continue;
        // edge-based distance feels more natural than centers
        const along =
          dir[0] > 0 ? r.left - a.right : dir[0] < 0 ? a.left - r.right : dir[1] > 0 ? r.top - a.bottom : a.top - r.bottom;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        if ((cx - ax) * dir[0] + (cy - ay) * dir[1] <= 1) continue;
        const overlap =
          dir[0] !== 0
            ? Math.min(a.bottom, r.bottom) - Math.max(a.top, r.top)
            : Math.min(a.right, r.right) - Math.max(a.left, r.left);
        const across = dir[0] !== 0 ? Math.abs(cy - ay) : Math.abs(cx - ax);
        const score = Math.max(along, 0) + (overlap > 0 ? 0 : across * 3);
        if (score < bestScore) {
          bestScore = score;
          best = el;
        }
      }
      if (best) {
        e.preventDefault();
        focusElement(best);
      } else {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
}

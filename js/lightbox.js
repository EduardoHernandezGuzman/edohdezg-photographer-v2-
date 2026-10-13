import { lockScroll, unlockScroll } from "./utils.js";

export function initLightbox() {
  const dialog = document.querySelector(".lightbox");
  const triggers = Array.from(document.querySelectorAll(".lightbox-trigger"));

  if (!dialog || triggers.length === 0) {
    return;
  }

  const frames = Array.from(dialog.querySelectorAll(".lightbox-frame"));
  const caption = dialog.querySelector(".lightbox-caption");
  let index = 0;
  let activeFrame = 0;
  let lastTrigger = null;
  let requestId = 0;

  function imageInfo(trigger) {
    const img = trigger.querySelector("img");
    const match = img.getAttribute("src").match(/opt\/([a-z0-9]+)-\d+\./);
    const name = match ? match[1] : "";
    return { name, width: img.getAttribute("width"), alt: img.alt };
  }

  function sourcesFor(info) {
    const base = `./img/opt/${info.name}-${info.width}`;
    return { avif: `${base}.avif`, webp: `${base}.webp`, jpg: `${base}.jpg` };
  }

  function prefetch(position) {
    const info = imageInfo(
      triggers[(position + triggers.length) % triggers.length]
    );
    new Image().src = sourcesFor(info).avif;
  }

  function show(position) {
    const id = ++requestId;
    const info = imageInfo(triggers[position]);
    const nextFrame = frames[1 - activeFrame];
    const [avifSource, webpSource] = nextFrame.querySelectorAll("source");
    const nextImage = nextFrame.querySelector("img");
    const sources = sourcesFor(info);

    avifSource.srcset = sources.avif;
    webpSource.srcset = sources.webp;
    nextImage.src = sources.jpg;
    nextImage.alt = info.alt;
    dialog.classList.add("is-loading");

    const commit = () => {
      if (id !== requestId) {
        return;
      }

      frames[activeFrame].classList.remove("is-active");
      nextFrame.classList.add("is-active");
      activeFrame = 1 - activeFrame;
      dialog.classList.remove("is-loading");
      caption.textContent = `${position + 1} / ${triggers.length} · ${info.alt}`;
      prefetch(position + 1);
      prefetch(position - 1);
    };

    nextImage.decode().then(commit, commit);
  }

  function step(delta) {
    index = (index + delta + triggers.length) % triggers.length;
    show(index);
  }

  function open(position) {
    index = position;
    lastTrigger = triggers[position];
    show(index);
    dialog.showModal();
    lockScroll();
  }

  function cleanup() {
    requestId += 1;
    unlockScroll();
    dialog.classList.remove("is-loading");
    frames.forEach((frame) => {
      frame.classList.remove("is-active");
      frame.querySelectorAll("source").forEach((source) => {
        source.removeAttribute("srcset");
      });
      const img = frame.querySelector("img");
      img.removeAttribute("src");
      img.alt = "";
    });
    activeFrame = 0;
    if (lastTrigger) {
      lastTrigger.focus();
      lastTrigger = null;
    }
  }

  triggers.forEach((trigger, position) => {
    trigger.addEventListener("click", () => open(position));
  });

  dialog
    .querySelector(".lightbox-close")
    .addEventListener("click", () => dialog.close());
  dialog
    .querySelector(".lightbox-prev")
    .addEventListener("click", () => step(-1));
  dialog
    .querySelector(".lightbox-next")
    .addEventListener("click", () => step(1));

  dialog.addEventListener("close", cleanup);

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      step(-1);
    }
    if (event.key === "ArrowRight") {
      step(1);
    }
    if (event.key === "Home") {
      index = 0;
      show(index);
    }
    if (event.key === "End") {
      index = triggers.length - 1;
      show(index);
    }
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  let touchStartX = null;
  dialog.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].clientX;
    },
    { passive: true }
  );
  dialog.addEventListener(
    "touchend",
    (event) => {
      if (touchStartX === null) {
        return;
      }
      const delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 40) {
        step(delta < 0 ? 1 : -1);
      }
      touchStartX = null;
    },
    { passive: true }
  );
}

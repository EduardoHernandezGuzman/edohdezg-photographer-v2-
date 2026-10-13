let lockedScrollY = 0;

export function lockScroll() {
  if (document.body.classList.contains("no-scroll")) {
    return;
  }

  lockedScrollY = window.scrollY;
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.classList.add("no-scroll");
}

export function unlockScroll() {
  if (!document.body.classList.contains("no-scroll")) {
    return;
  }

  document.body.classList.remove("no-scroll");
  document.body.style.top = "";
  window.scrollTo(0, lockedScrollY);
}

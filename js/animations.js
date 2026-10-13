export function initAnimations() {
  document.documentElement.classList.add("js");
  revealElements();
  fadeInImages();
}

function revealElements() {
  const elements = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: "0px 0px -5% 0px" }
  );

  elements.forEach((element) => observer.observe(element));
}

function fadeInImages() {
  const images = document.querySelectorAll(".project-img");

  images.forEach((image) => {
    if (image.complete) {
      image.classList.add("is-loaded");
      return;
    }

    const show = () => image.classList.add("is-loaded");
    image.addEventListener("load", show, { once: true });
    image.addEventListener("error", show, { once: true });
  });
}

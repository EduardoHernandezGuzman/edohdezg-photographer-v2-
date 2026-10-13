export function initContact() {
  const emailLink = document.querySelector(".contact-email");

  if (!emailLink) {
    return;
  }

  let email;

  try {
    email = atob(emailLink.dataset.email);
  } catch {
    return;
  }

  emailLink.href = `mailto:${email}`;
  emailLink.textContent = email;

  const wrapper = emailLink.closest(".contact-link");

  if (!wrapper || !navigator.clipboard) {
    return;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "copy-email";
  button.textContent = "Copiar email";

  const status = document.createElement("p");
  status.className = "copy-status";
  status.setAttribute("role", "status");

  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
      status.textContent = "Email copiado";
    } catch {
      status.textContent = "No se pudo copiar";
    }

    window.setTimeout(() => {
      status.textContent = "";
    }, 2500);
  });

  wrapper.append(button, status);
}

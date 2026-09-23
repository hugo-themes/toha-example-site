// Project filter: All / Professional / Academic
(() => {
  const buttons = [...document.querySelectorAll('.filter')];
  const projects = [...document.querySelectorAll('.project')];
  if (!buttons.length || !projects.length) return;

  const matches = (project, filter) => filter === 'All' || project.dataset.kind === filter;

  for (const button of buttons) {
    const filter = button.dataset.filter;
    button.querySelector('.filter__count').textContent =
      projects.filter((p) => matches(p, filter)).length;
    button.addEventListener('click', () => apply(filter));
  }

  function apply(filter) {
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    }
    let first = true;
    for (const project of projects) {
      const visible = matches(project, filter);
      project.hidden = !visible;
      project.classList.toggle('is-first', visible && first);
      if (visible) first = false;
    }
  }
})();

// Footer year
for (const el of document.querySelectorAll('[data-year]')) {
  el.textContent = new Date().getFullYear();
}

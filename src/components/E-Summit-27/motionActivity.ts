/** Subscribe to whether decorative motion can actually be seen. */
export function observeMotionActivity(
  element: Element,
  onChange: (active: boolean) => void,
  rootMargin = "0px",
) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  let visible = false;
  let previous: boolean | undefined;
  const update = () => {
    const active = visible && !document.hidden && !reduce.matches;
    if (active !== previous) {
      previous = active;
      onChange(active);
    }
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    update();
  }, { rootMargin });
  observer.observe(element);
  document.addEventListener("visibilitychange", update);
  reduce.addEventListener("change", update);
  update();
  return () => {
    observer.disconnect();
    document.removeEventListener("visibilitychange", update);
    reduce.removeEventListener("change", update);
  };
}

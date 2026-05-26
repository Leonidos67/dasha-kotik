/** Tasks shown to players (not hidden in admin). */
export function visibleTasks(tasks = []) {
  return tasks.filter((t) => !t.hidden);
}

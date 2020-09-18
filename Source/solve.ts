import { WatchList, Assignment } from "./Types.ts";
import { update } from "./watch.ts";

/**
 * Finds assignments that satisfy the provided clauses.
 * 
 * @param variables The variables in use.
 * @param wl The watch list.
 * @param variable The variable to start at.
 * @param assignment The starting assignment
 */
export function* solve(
  variables: string[],
  wl: WatchList,
  variable: number,
  assignment: Assignment,
): Generator<Assignment, void, unknown> {
  if (variable === variables.length) {
    yield assignment;
    return;
  }

  for (const value of ([0, 1] as const)) {
    assignment[variable] = value;

    const updated = update(wl, variable << 1 | value, assignment);
    if (updated) {
      yield* solve(variables, wl, variable + 1, assignment);
    }
  }

  assignment[variable] = null;
}

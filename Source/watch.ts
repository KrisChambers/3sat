import { Clause, WatchList, Literal, Assignment } from "./Types.ts";

/**
 * Creates a list whose indexes are literals and elements
 * are a list of all clauses currently watching that literal.
 *
 * @param varCount The number of variables
 * @param clauses The clauses to add.
 */
export function createList(varCount: number, clauses: Clause[]) {
  const watchList: WatchList = new Array(2 * varCount);
  for (let i = 0; i < 2 * varCount; i++) {
    watchList[i] = [];
  }

  clauses.forEach((clause) => {
    watchList[clause[0]].push(clause);
  });

  return watchList;
}

/**
 * Updates the watch list to preserve the invariant:
 * if clause `c` is watching literal `l` then `l` is not false.
 * 
 * @param list The list of watchers.
 * @param falseLiteral The literal that is false.
 * @param assignment The current assignment.
 * 
 * @returns false if there is no possible update.
 */
export function update(
  list: WatchList,
  falseLiteral: Literal,
  assignment: Assignment,
) {
  // iterate over the clauses watching the false literal.
  const watchers = list[falseLiteral];
  for (const clause of watchers) {
    let hasAlternative = false;

    for (const alt of clause) {
      const v = alt >> 1; // get variable from literal
      const a = alt & 1; // is it negated?

      // if it is not set or if it is the negation of v.
      if (assignment[v] === null || assignment[v] === (a ^ 1)) {
        hasAlternative = true;
        list[alt].push(clause);
        break;
      }
    }

    // If we do not find an alternative to watch then
    // we have reached a contradiction.
    if (!hasAlternative) {
      return false;
    }
  }

  // Clear the list of those watching the false literal.
  list[falseLiteral] = [];

  return true;
}

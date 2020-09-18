import { VariableTable, Clause, Assignment } from "./Types.ts";
import { parse } from "./input.ts";
import { solve } from "./solve.ts";
import { createList } from "./watch.ts";

/**
 * A SAT type wrapping all the functionality.
 * 
 * Each instance should be used to solve a group of clauses.
 */
export class SAT {
  /**
   * Constructs a new instance of the SAT solver.
   */
  constructor() {
    this.#varTable = new Map();
    this.#vars = [];
    this.#clauses = [];
  }

  /**
   * Adds a Clause from a string.
   *
   * @param lines A space separated list of literals.
   */
  addClauseFromString(...lines: string[]) {
    for (const line of lines) {
      this.addClause(parse(this.#varTable, this.#vars, line));
    }
  }

  /**
   * Adds a `Clause` to the SAT instance.
   * 
   * Throws an error if we have already solved the clauses.
   *
   * @param clause The clauses to be added.
   */
  addClause(...clause: Clause[]) {
    if (this.hasSolution()) {
      throw new Error("Solution found: cannot add new clauses.");
    }

    this.#clauses.push(...clause);
  }

  /**
   * Finds an assignment satisfying all the clauses.
   * 
   * If no assignment is found returns null.
   */
  solve() {
    if (this.#solution === undefined) {
      const wl = createList(this.#vars.length, this.#clauses);

      const initial = new Array(this.#vars.length).fill(null);

      for (const assignment of solve(this.#vars, wl, 0, initial)) {
        this.#solution = new ValidAssignment(assignment, this.#vars);
        break;
      }

      this.#solution = this.#solution || new None();
    }

    return this.#solution;
  }

  /**
   * Returns a flag indicating that the clauses have a solution.
   */
  hasSolution() {
    return this.#solution !== undefined;
  }

  #solution: Solution | undefined = undefined;
  #varTable: VariableTable;
  #vars: string[];
  #clauses: Clause[];
}

interface Solution {
  assignment: Assignment | null;

  exists: boolean;

  asString(): string;

  asJSON(): string;

  asObject(): Record<string, 0 | 1> | null;
}

class ValidAssignment implements Solution {
  constructor(assignment: Assignment, variables: string[]) {
    this.#assignment = assignment;
    this.#variables = variables;
  }

  get assignment() {
    return this.#assignment;
  }

  get exists() {
    return true;
  }

  asString() {
    const json = this.asJSON();

    return JSON.stringify(json)
      .replaceAll('"', "")
      .replaceAll(":", " = ")
      .replaceAll(",", ", ");
  }

  asJSON() {
    return JSON.stringify(this.asObject());
  }

  asObject() {
    const map: Record<string, 0 | 1> = {};
    for (let i = 0; i < this.#variables.length; i++) {
      const variable = this.#variables[i];
      const value = this.#assignment[i];

      map[variable] = value!;
    }

    return map;
  }

  #assignment: Assignment;
  #variables: string[];
}

class None implements Solution {
  get assignment() {
    return null;
  }
  get exists() {
    return false;
  }
  asString() {
    return "";
  }
  asJSON() {
    return "";
  }
  asObject() {
    return null;
  }
}

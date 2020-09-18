import {
  assert,
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std@0.50.0/testing/asserts.ts";
import { parse } from "./Source/input.ts";
import { createList, update } from "./Source/watch.ts";
import { solve } from "./Source/solve.ts";
import { Clause, Assignment } from "./Source/Types.ts";
import { SAT } from "./Source/SAT.ts";

function clauseEq(a: Clause, b: Clause) {
  return a
    .map((v, i) => v === b[i])
    .reduce((p, c) => p && c, true);
}

function literalToVariable(literal: number): number {
  return literal >> 1;
}

function variableToLiteral(variable: number, negated: boolean) {
  return variable << 1 | (negated ? 1 : 0);
}

function negate(literal: number) {
  return literal ^ 1;
}

function isNegated(literal: number): boolean {
  return Boolean(literal & 1);
}

Deno.test("clause equality", () => {
  const a = parse(new Map(), [], "A B ~C");
  const b = parse(new Map(), [], "A B ~C");

  assert(clauseEq(a, b));

  const x = parse(new Map(), [], "A B C");
  const y = parse(new Map(), [], "A B ~C");

  assert(!clauseEq(x, y));
});

Deno.test("negate", () => {
  assertEquals(negate(0b10), 0b11);
});

Deno.test("shift by 0", () => {
  assertEquals(1 << 1 | 0, 1 << 1);
  assert((1 << 1 | 1) !== (1 << 1 | 0));
});

Deno.test("encoding clauses 1", () => {
  const table = new Map<string, number>();
  const variables: string[] = [];
  const clause = parse(table, variables, "A B ~C");

  assertEquals(clause[0], 0);
  assertEquals(clause[1], 2);
  assertEquals(clause[2], 5);
});

Deno.test("encoding clauses 2", () => {
  const table = new Map<string, number>();
  const variables: string[] = [];
  const clause = parse(table, variables, "A B C");

  assertEquals(clause[0], 0);
  assertEquals(clause[1], 2);
  assertEquals(clause[2], 4);
});

Deno.test("literalToVariable", () => {
  const table = new Map<string, number>();
  const variables: string[] = [];
  const clause = parse(table, variables, "A B C");

  assertEquals(literalToVariable(clause[0]), 0);
  assertEquals(literalToVariable(clause[2]), 2);
});

Deno.test("variableToLiteral", () => {
  assertEquals(
    variableToLiteral(0b00, false),
    0b00,
  );

  assertEquals(
    variableToLiteral(0b00, true),
    0b01,
  );

  assertEquals(
    variableToLiteral(0b01, false),
    0b10,
  );

  assertEquals(
    variableToLiteral(0b01, true),
    0b11,
  );
});

Deno.test("creating watchlist", () => {
  const table = new Map<string, number>();
  const variables: string[] = [];
  const clauses: Clause[] = [];

  clauses.push(parse(table, variables, "A B ~C"));
  clauses.push(parse(table, variables, "~A ~B ~C"));

  const wl = createList(variables.length, clauses);

  assert(clauseEq(wl[0][0], clauses[0]));
  assert(clauseEq(wl[1][0], clauses[1]));
});

Deno.test("update watchlist", () => {
  const table = new Map<string, number>();
  const variables: string[] = [];
  const clauses: Clause[] = [];

  // (0, 2, 5)
  clauses.push(parse(table, variables, "A B ~C"));
  // 0 -> [ (0, 2, 5)]
  const wl = createList(variables.length, clauses);

  // 1 -> [(0, 2, 5)]
  update(wl, 0b00, [0, null, null]);

  assert(wl[0].length === 0);
  assert(clauseEq(wl[2][0], [0, 2, 5]));
});

Deno.test("solve test 1", () => {
  const table = new Map<string, number>();
  const variables: string[] = [];
  const clauses: Clause[] = [];

  // (0, 2, 5)
  clauses.push(parse(table, variables, "A B C"));
  clauses.push(parse(table, variables, "~A ~B ~C"));
  // 0 -> [ (0, 2, 5)]
  const wl = createList(variables.length, clauses);

  const model = solve(variables, wl, 0, [null, null, null]);
  assert(model.next().value !== null);
});

function* parseClauses(
  table: Map<string, number>,
  variables: string[],
  ...raw: string[]
) {
  for (const clause of raw) {
    yield parse(table, variables, clause);
  }
}

Deno.test("unsatisfiable", () => {
  const table = new Map<string, number>();
  const variables: string[] = [];
  const clauses: Clause[] = Array.from(
    parseClauses(table, variables, "A", "~A"),
  );
  const wl = createList(variables.length, clauses);

  const model = solve(variables, wl, 0, [null]);

  const assignment = model.next().value;
  assertEquals(assignment, undefined);
});

Deno.test("complex unsatisfiable", () => {
  const table = new Map<string, number>();
  const variables: string[] = [];
  const clauses: Clause[] = Array.from(
    parseClauses(
      table,
      variables,
      "B C ~D",
      "A C D",
      "~A B D",
      "~A ~B C",
      "~B ~C D",
      "~A ~C ~D",
      "A ~B ~D",
      "A B ~C",
    ),
  );

  const wl = createList(variables.length, clauses);
  const validAssignment = solve(variables, wl, 0, [null, null, null, null])
    .next();
  assertEquals(validAssignment.value, undefined);
});

Deno.test("complex unsatisfiable", () => {
  const table = new Map<string, number>();
  const variables: string[] = [];
  const clauses: Clause[] = Array.from(
    parseClauses(
      table,
      variables,
      "B C ~D",
      "A C D",
      "~A B D",
      "~A ~B C",
      "~B ~C D",
      "~A ~C ~D",
      "A ~B ~D",
      //"A B ~C",// <- This makes it unsatisfiable
    ),
  );

  const wl = createList(variables.length, clauses);
  const validAssignment = solve(variables, wl, 0, [null, null, null, null])
    .next();
  const [w, x, y, z] = validAssignment.value as Assignment;
});

Deno.test("SAT instance solver tests", () => {
  const sat = new SAT();
  sat.addClauseFromString(
    "B C ~D",
    "A C D",
    "~A B D",
    "~A ~B C",
    "~B ~C D",
    "~A ~C ~D",
    "A ~B ~D",
  );

  const solution = sat.solve();
  assertNotEquals(solution.asString(), "");
  assert(solution.exists);

  const unsat = new SAT();
  unsat.addClauseFromString(
    "B C ~D",
    "A C D",
    "~A B D",
    "~A ~B C",
    "~B ~C D",
    "~A ~C ~D",
    "A ~B ~D",
    "A B ~C",
  );

  const nonSolution = unsat.solve();
  assertEquals(nonSolution.asString(), "");
  assertEquals(nonSolution.exists, false);
});

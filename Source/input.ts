import { InputVariable, InputClause, Clause, VariableTable } from "./Types.ts";

/**
 * Parses an input clause into an encoded clause.
 * 
 * @param table The table of variables.
 * @param variables The list of parsed variables.
 * @param clause The raw clause.
 */
export function parse(
  table: VariableTable,
  variables: InputVariable[],
  clause: InputClause,
): Clause {
  const rawTuple = clause.split(" ");

  return rawTuple
    .map((literal) => {
      const isNegated = literal.startsWith("~") ? 1 : 0;
      const variable = literal[isNegated];

      if (!table.has(variable)) {
        table.set(variable, variables.length);
        variables.push(variable);
      }

      const encLiteral = table.get(variable)! << 1 | isNegated;
      return encLiteral;
    });
}

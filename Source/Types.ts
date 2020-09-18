/**
 * A clause is a space separated collection of literals.
 */
export type InputClause = string;

/**
 * Each literal is a single character optional preceded by a
 * negation identifier (~).
 * 
 * Literals are Variables or their negation.
 */
export type InputLiteral = string;

/**
 * Each variable is a single character.
 */
export type InputVariable = string;

/**
 * Clauses are tuples of encoded literals.
 * 
 * Ex:
 * (A, ~B, C) -> (0, 3, 4)
 */
export type Clause = number[];

/**
 * Literals are shifter variables whose LSB indicates negation.
 * 
 * Ex:
 * (A, ~B, C): ~B = 2^1 + 1 = 3
 */
export type Literal = number;

/**
 * Literals are encoded as numerical indicies representing
 * their order encounterd during parsing.
 * 
 * Ex:
 * "A B C": A -> 0, B -> 1, C -> 2
 */
export type Variable = number;

/**
 * Mapping between InputVariable names and their encodings
 */
export type VariableTable = Map<InputVariable, Variable>;

/**
 * An array of lists maintaining which clauses are watching which
 * of their literals.
 * 
 * There are 2*N possible literals, where N is the number of variables.
 */
export type WatchList = Array<Clause[]>;

/**
 * Possible values that can be assigned to variables.
 * 
 * `null` indicates that it has not been assigned yet.
 */
export type Value = 0 | 1 | null;

/**
 * An assignment is an array of N Values. Where the i'th
 * value is assigned to the i'th variable represented
 * by Variable.
 * 
 * Given const v: Variable = ..
 * then
 * Assignment[v] == 0 => it is assigned false
 * Assignment[v] == 1 => it is assigned true
 * Assignment[v] == null => it has not been assigned yet.
 */
export type Assignment = Value[];

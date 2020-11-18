# Simple SAT

This is an implementation of knuth's "miniaml decent SAT solver"
introduced [here](https://www-cs-faculty.stanford.edu/~knuth/programs/sat0w.w)

Additionally [this](https://www.academia.edu/9255616/Simple_and_Efficient_SAT_Solving_using_Watched_Literals) paper
also explains the watch literal techinique.

## Example

```typescript
const sat = new SAT();
sat.addClauseFromString(
  "A ~B",
  "A B"
)

const solution = sat.solve()
```

## TODO

1. Implement known improvements.
1. Make iterative instead of recursive. (SAT formulas can get really big)
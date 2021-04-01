# Simple SAT

This is an implementation of knuth's "minimal decent SAT solver"
introduced [here](https://www-cs-faculty.stanford.edu/~knuth/programs/sat0w.w)

Additionally, [this](https://www.academia.edu/9255616/Simple_and_Efficient_SAT_Solving_using_Watched_Literals) paper
also explains the watched literal techinique used here.

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
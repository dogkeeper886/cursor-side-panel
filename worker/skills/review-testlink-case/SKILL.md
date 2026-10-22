---
description: >-
  A TestLink test case guides a tester through one objective. Loose names,
  broad preconditions and overloaded steps obscure that objective. The
  reviewer loses sight of which actions and expected results prove the
  objective. This skill reviews each field from the objective down to concise
  steps.
---

Review a TestLink test case:
1. You get the test case from TestLink.
2. You review the name, the summary, the precondition, and the steps.
3. The name is `[Action] [object] with [the condition that sets this case apart]`.
4. The summary is `Verify that [object] is [past participle of the Action] with [the condition that sets this case apart]`.
5. The precondition is a bullet of `[Object] is [state].`, one object already true before the first step.
6. The action is an imperative that does one thing to one control, in the product's words.
7. The expected is `[What is visible] is [state].`, the present-tense result of that action.
8. You present the review in the template below, one row per precondition item, action and expected, and every revised line shows ~~the words at fault~~ *the fix* after them.

```markdown
| Field | Line |
|---|---|
| Name | {original, with ~~the words at fault~~ *the fix* after them} |
| Summary | {original, with ~~the words at fault~~ *the fix* after them} |
| Precondition {N} | {original, with ~~the words at fault~~ *the fix* after them} |
| Step {N} Action | {original, with ~~the words at fault~~ *the fix* after them} |
| Step {N} Expected | {original, with ~~the words at fault~~ *the fix* after them} |
```

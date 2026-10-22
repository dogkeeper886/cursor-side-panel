---
description: >-
  An agent fixes a text's phrasing by its own ideas. The agent hands back only
  the rewrite. The rewrite hides which subject, action, filler, negative or
  hidden action it changed. The reader can neither check the rewrite nor learn
  from it. This skill asks the agent to study a text's phrasing by the steps
  below.
---

Review sentences:
1. On the input text, bold each sentence's subject and put its action in a code span.
2. On the step 1 result, strike through redundancy and bloat.
3. Output the step 2 result with its marks and strike-throughs in a quote block under "Bloat struck", then a clean version with the struck words removed and no marks under "Clean".
4. On the step 3 clean output, bold the character that should be central and put its action in a code span, when it has one.
5. Output the step 4 result with its marks in a quote block under "Central characters".
6. On the step 5 clean output, strike through each negative sentence and put its affirmative rewrite after it.
7. Output the step 6 result with its marks and strike-throughs in a quote block under "Negatives rewritten", then a clean version with the struck sentences removed and no marks under "Affirmative".
8. On the step 7 clean output, strike through each sentence with a nominalization that hides an action and put its verb rewrite after it.
9. Output the step 8 result with its marks and strike-throughs in a quote block under "Nominalizations", then a clean version with the struck sentences removed and no marks under "Verbs".

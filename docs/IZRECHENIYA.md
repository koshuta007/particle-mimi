# Rules for an example sentence

Written after Ivaylo asked, on 2026-08-25, for simpler sentences and for the
hints to stop giving the answer away.

1. **Short.** Eight to twelve words. A gapped sentence he has to unpick before
   he can even see the hole is testing reading, not recall.
2. **Plain and everyday.** Something said in a kitchen or an office, not a
   novel. No subordinate clause stacked on a subordinate clause.
3. **One answer only.** The words around the gap must lock the target out of
   every rival verb. This is the failure that costs him marks he did not
   deserve to lose, and it is what the adversarial pass exists to catch.
4. **Exactly the card's sense.** Not another sense of the same verb.
5. **Six context words minimum** after the verb is blanked. `src/round.py`
   refuses to use anything thinner.
6. **Never reused.** `round.py` prints RECYCLED SENTENCES when a card is about
   to be asked on a sentence it has been asked on before.

## The hint

The hint is the meaning, plus at most a first letter when a merely-acceptable
alternative would otherwise make it a coin toss. Never the particle, never the
verb itself. If two verbs are fully interchangeable in that sense they are
**twins** (`twins` in the data): either answer is correct and the card
advances, so no hint is needed at all.

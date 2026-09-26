# World System Brief — discourse.md

> **Editorial language contract**
>
> Status: v0.1
>
> Applies to: Daily Brief, Weekly Review, System Ledger UI, alerts, social distribution, charts, captions, summaries, and LLM-generated editorial drafts.
>
> Product languages: **en / ua**
>
> This document governs **how WSB speaks**.
>
> `brain.md` defines what WSB is.  
> `schema/` defines how WSB remembers.  
> **`discourse.md` defines how WSB turns the model into language without destroying the model.**

---

# 1. Editorial premise

WSB does not narrate the news cycle.

WSB describes changes in a system.

The fundamental editorial transformation is:

```text
HEADLINE
   ↓
MECHANISM
   ↓
FLOW
   ↓
DEPENDENCY
   ↓
BOTTLENECK
   ↓
LEVERAGE
   ↓
RENT
   ↓
ADAPTATION
   ↓
Δ
```

If a sentence cannot survive this transformation, it probably belongs to ordinary news commentary rather than WSB.

Core editorial rule:

> **If the arrow didn't move, it isn't the story.**

Companion rule:

> **Track the arrow, not the speech.**

---

# 2. What WSB voice should feel like

WSB should sound:

- precise;
- calm;
- compact;
- structural;
- skeptical of spectacle;
- explicit about mechanisms;
- explicit about uncertainty;
- interested in change over time;
- comfortable saying “nothing material changed.”

WSB should not sound:

- breathless;
- prophetic;
- ideological;
- conspiratorial;
- triumphalist;
- alarmist;
- diplomatic-bureaucratic;
- consultant-vague;
- investment-hype driven;
- like a rewritten Reuters headline;
- like a geopolitical YouTube thumbnail.

The ideal voice is somewhere between:

```text
scientific note
+ intelligence brief
+ market terminal
+ very good explanatory journalism
```

but without pretending to certainty that the evidence does not support.

---

# 3. WSB writes mechanisms, not moods

Bad:

> Tensions are rising between China and Europe.

Better:

> The EU added a new market-access constraint while dependence on Chinese battery components remained materially unchanged.

Bad:

> China is increasing pressure on Western supply chains.

Better:

> New licensing requirements increased the time and administrative cost of accessing a China-concentrated processing stage.

Bad:

> Europe is becoming more independent.

Better:

> New European refining capacity reduced expected substitution time, but current import dependence remains high.

The WSB sentence should identify **what changed and through which mechanism**.

---

# 4. The minimum useful sentence

Whenever practical, a structural sentence contains four elements:

```text
ACTOR / NODE
+ ACTION OR CHANGE
+ SYSTEM RELATION
+ CONSEQUENCE
```

Example:

> New EU procurement rules raise the value of local assembly, but do not remove dependence on China-linked battery inputs.

The strongest sentences often add a fifth:

```text
+ TIME / COMPARISON
```

Example:

> New EU procurement rules raise the value of local assembly, but near-term dependence on China-linked battery inputs remains largely unchanged.

---

# 5. Δ language

A WSB story is preferably expressed as a transition.

Use:

```text
high → very high
planned → operational
binding → easing
absent → developing
3–5 years → 1–3 years
China ↑
EU →
```

Prose should explain the transition rather than replace it.

Example:

```text
SUBSTITUTABILITY
LOW → MEDIUM
```

Then:

> The change reflects operational alternative capacity, not merely announced investment.

The visual Δ and prose must agree.

---

# 6. Event is not consequence

Never imply that an announcement automatically changes the system.

Forbidden inference:

```text
new factory announced
therefore
dependency ↓
```

Correct sequence:

```text
factory announced
→ adaptation: absent → planned
→ current dependency: unchanged
```

Only later, with evidence:

```text
capacity operational at material scale
→ substitutability ↑
→ dependency ↓
```

Editorial language must preserve this distinction.

---

# 7. Scope every claim

Broad claims are dangerous because they hide the unit of analysis.

Bad:

> China dominates rare earths.

Better:

> China remains highly concentrated in rare-earth separation and refining.

Better still, when evidence permits:

> China retains high leverage over access to rare-earth separation and refining because near-term substitution remains limited.

Bad:

> Europe has leverage over China.

Better:

> The EU holds regulatory leverage over access to parts of its vehicle market.

A WSB claim should make clear:

- leverage over **what**;
- dependence on **what**;
- bottleneck at **which node**;
- substitution over **which horizon**;
- rent captured **where**.

---

# 8. Separate physical and regulatory reality

Do not write as though every constraint is physical.

Distinguish:

```text
physical capacity
transport capacity
technology access
licensing
market access
standards
rules of origin
financial access
procurement eligibility
```

Example:

> Vehicle assembly capacity increased, while the binding constraint shifted toward component origin and subsidy eligibility.

This is more informative than:

> Europe tightened trade rules.

---

# 9. Bottleneck migration language

WSB treats bottleneck migration as a central phenomenon.

Preferred construction:

> The bottleneck did not disappear; it moved from X to Y.

Or:

> Localization reduced the finished-vehicle constraint but increased the relative importance of component origin.

Or:

> The bypass relieved route pressure but shifted the constraint toward terminal capacity.

Avoid declaring a problem “solved” when it has moved.

---

# 10. Dependency language

Dependency is relational.

Never write:

> Country X is dependent.

Write:

> Country X is highly dependent on Y for Z.

Or:

> X depends on Y at the refining stage, while upstream extraction is more diversified.

Always try to specify:

```text
WHO
depends on
WHOM / WHAT
for
WHICH FLOW / STAGE
over
WHAT TIME HORIZON
```

---

# 11. Leverage language

`leverage` is one of WSB's core terms and one of its easiest terms to abuse.

Leverage means:

> **the practical ability of an actor, node, institution, or position in a network to alter another actor's available choices, costs, access, timing, or risk because of a structured dependency or constraint.**

Leverage is not:

- generic importance;
- prestige;
- diplomatic visibility;
- “influence” in the abstract;
- military strength in general;
- GDP;
- rhetorical aggression.

Leverage must always be scoped.

Bad:

> China gained leverage.

Good:

> China gained leverage over near-term access to this processing stage.

---

# 12. Ukrainian terminology: leverage

There is no single Ukrainian word that should mechanically replace `leverage` in every context.

Possible renderings:

### `важелі впливу`

Use when describing practical instruments available to an actor.

### `переговорна сила`

Use when the mechanism is bargaining power.

### `структурний вплив`

Use when describing positional/network power and a more natural phrase is needed.

### `вплив`

Use only when scope and mechanism are already explicit. Alone, it is often too vague.

Do **not** force one translation globally.

The underlying Ledger concept remains:

```text
leverage
```

The `ua` rendering is contextual.

---

# 13. Rent language

`rent` in WSB means economic rent / value captured because of a privileged position, scarce capacity, regulation, IP, network position, resource control, or other constraint.

It does **not** mean ordinary rental payment.

Possible Ukrainian renderings:

- `рента` — when the political-economic meaning is clear;
- `рентний дохід`;
- `додаткова рента`;
- contextual explanation such as `додатковий дохід від дефіцитної логістичної потужності`.

Avoid using `рента` unexplained for broad audiences when it can be confused with property rent.

Preferred WSB move:

> Shipping constraints shifted additional rent toward tanker owners.

UA:

> Обмеження судноплавства змістили додаткову ренту на користь власників танкерів.

When needed, explain the mechanism immediately.

---

# 14. Bypass / adaptation language

`bypass` is a structural workaround around a constraint.

Possible UA terms:

- `обхід`;
- `обхідний маршрут`;
- `альтернативний канал`;
- `механізм обходу`;
- `адаптація`.

Choose according to mechanism.

A bypass can be:

```text
planned
partial
capacity-limited
temporary
operational
scaling
failed
```

Never write merely:

> An alternative exists.

Specify whether it can materially substitute the constrained flow.

---

# 15. Constraint / bottleneck / chokepoint

These terms are related but not interchangeable.

## constraint

Any condition limiting or conditioning a flow/relation.

UA:

`обмеження`

## bottleneck

A constraint that is materially binding for system throughput, access, substitution, or choice.

UA preferred:

`вузьке місце`

In more formal contexts:

`критичне обмеження`

## chokepoint

A physically or institutionally concentrated passage/node through which a large flow must pass and for which alternatives are limited.

UA depending on context:

`критичний вузол`
`вузький прохід`
`ключова точка проходження`

Do not translate every `chokepoint` mechanically as `вузьке місце`; preserve the distinction when useful.

---

# 16. Substitutability language

Always distinguish:

```text
an alternative exists
```

from:

```text
an alternative can replace the flow at relevant scale and within relevant time
```

Substitutability requires at least:

- technical feasibility;
- capacity;
- cost;
- time;
- access.

Preferred:

> Alternatives exist, but none can replace the constrained capacity at comparable scale within 12 months.

UA:

> Альтернативи існують, але жодна з них не здатна замістити обмежену потужність у співставному масштабі протягом 12 місяців.

---

# 17. Confidence and uncertainty

Uncertainty is information.

Do not hide it behind vague verbs.

Prefer explicit forms:

```text
confirmed
developing
uncertain
evidence incomplete
direction clear; magnitude uncertain
announcement only
operational status unverified
```

Bad:

> This could dramatically reshape the market.

Better:

> If the announced capacity becomes operational on schedule, substitution time would shorten; current dependency is unchanged.

Distinguish:

```text
we know X
we infer Y
we do not yet know Z
```

---

# 18. Causality

Do not turn sequence into causality.

Bad:

> Tariffs caused production to move.

Unless evidence supports that causal claim.

Prefer:

> Production shifted after the tariff change; company statements and investment timing indicate the tariff was one factor.

Or:

> The move is consistent with an attempt to reduce tariff exposure.

Use causal verbs only when evidence supports mechanism.

Strong causal verbs:

```text
caused
forced
drove
triggered
resulted in
```

require stronger evidence than:

```text
contributed to
increased the incentive to
is consistent with
followed
coincided with
```

---

# 19. Attribution

Avoid anonymous authority.

Bad:

> Experts say the dependency is unsustainable.

Good:

> The IEA estimates...

Good:

> Company filings indicate...

Good:

> Customs data show...

Good:

> Two industry associations reported...

When WSB makes an analytical inference, own it explicitly:

> **WSB assessment:** the new capacity shortens the plausible substitution horizon but is not yet large enough to change current dependency from high.

Do not disguise WSB inference as source fact.

---

# 20. Numbers

Use numbers when they change understanding.

Do not use numbers merely to simulate rigor.

Bad:

> A 17.3% increase demonstrates a dramatic transformation.

Better:

> Capacity rose 17.3%, but remains below the volume required to substitute current imports.

Always ask:

> What is the denominator and why does this number matter to the system relation?

Prefer ranges when precision is not warranted.

---

# 21. Comparisons

Every claim of increase/decrease should have an implicit or explicit baseline.

Bad:

> Dependence is growing.

Good:

> Import dependence rose from X to Y between DATE and DATE.

If no quantitative baseline exists:

> Evidence since June indicates a strengthening dependence, primarily at the refining stage.

Never use trend language without temporal scope.

---

# 22. Headlines

WSB headlines should encode a mechanism or Δ.

Good:

> **EU localization shifts the EV bottleneck toward component origin**

Good:

> **Hormuz risk raises shipping costs before reducing physical flow**

Good:

> **New refining project creates a future bypass; current dependence unchanged**

Bad:

> **Europe Strikes Back**

Bad:

> **China Tightens Its Grip**

Bad:

> **A New Era for Global Trade**

Bad:

> **The Battle for Rare Earths**

Bad:

> **Everything Just Changed**

---

# 23. Section language

## SYSTEM DELTA

Short, declarative, measurable where possible.

## BOTTLENECK WATCH

State + movement.

Example:

```text
× REFINING — BINDING →
× LICENSING — ACTIVE ↑
↪ EU CAPACITY — PLANNED
```

## CHAIN OF THE DAY

Explain where value, dependence and constraints sit.

## WEAPONIZED INTERDEPENDENCE

Use this label only where a network position is being used, or credibly prepared for use, as a coercive instrument.

Do not classify every dependency as weaponized.

## NOISE CHECK

Purpose:

> test whether a loud event produced a material structural change.

“No change” is a successful analytical result.

---

# 24. English style

Use international English.

Prefer:

- short sentences;
- active voice when actor is known;
- concrete nouns;
- explicit mechanisms;
- restrained adjectives;
- verbs that describe actual change.

Avoid excessive noun stacks.

Bad:

> strategic critical mineral supply chain resilience enhancement initiative

Better:

> a program intended to diversify critical-mineral supply.

Avoid finance-terminal parody. Symbols should compress information, not make prose unreadable.

---

# 25. Ukrainian style

The Ukrainian edition should read as **native analytical Ukrainian**, not translated English.

Do not preserve English syntax when Ukrainian has a clearer construction.

Avoid:

- bureaucratic calques;
- unnecessary passive voice;
- Russian syntactic residue;
- overloaded chains of genitives;
- fashionable English loanwords where a precise Ukrainian term exists.

But do not force unnatural purism.

If the international technical term is clearer and widely understood, use it and define it when needed.

The UA edition should preserve:

- the same analytical claim;
- the same degree of certainty;
- the same causal strength;
- the same Δ;
- the same scope.

It does **not** need to preserve sentence structure.

Rule:

> **Translate the model, not the sentence.**

---

# 26. EN ↔ UA semantic parity

Translation QA must check meaning, not word matching.

These must remain identical across languages:

```text
direction of Δ
confidence
actor
relation
time horizon
causal strength
scope
quantitative values
status
```

Forbidden translation drift:

EN:

> may reduce dependence if capacity reaches commercial scale

UA:

> зменшить залежність

The UA version incorrectly upgrades conditional to certain.

Correct:

> може зменшити залежність, якщо потужність вийде на комерційний масштаб

---

# 27. ANTI-LEXICON / АНТИСЛОВНИК

This section is intentionally opinionated.

The words below are not all absolutely forbidden.

Many are **warning lights**: if they appear, the editor must ask whether the model underneath the sentence is missing.

## 27.1 Empty drama

| Avoid | Why | Replace with |
|---|---|---|
| game-changer | no defined state change | name the Δ |
| dramatic shift | magnitude undefined | specify before → after |
| seismic change | decorative metaphor | state which relation changed |
| watershed moment | historical claim without test | compare with prior state |
| historic | usually inflationary | explain what is unprecedented and over what period |
| unprecedented | requires historical evidence | give comparison period |
| massive | scale-free adjective | quantify |
| huge | scale-free adjective | quantify |
| stunning | reader emotion, not analysis | describe the result |
| shocking | reader emotion | describe evidence |
| explosive growth | cliché | give growth rate + baseline |
| everything changed | almost never true | list changed dimensions |
| new era | unfalsifiable | identify structural break |

UA warning equivalents:

```text
драматичний зсув
історичний момент
безпрецедентний
величезний
колосальний
шокуючий
вибухове зростання
нова ера
змінило все
```

---

## 27.2 Geopolitical theatre

| Avoid | Why | Replace with |
|---|---|---|
| geopolitical chessboard | states are not chess pieces | describe network/relation |
| chess move | implies unitary strategist | identify institution + action |
| power play | mechanism unclear | specify instrument |
| flexes its muscles | anthropomorphic cliché | specify capacity/action |
| strikes back | narrative combat framing | describe policy response |
| fires a warning shot | metaphorical | describe signal/action |
| battle for X | hides economic mechanism | identify access/capacity/rent |
| war for resources | often unsupported | describe competition and constraints |
| tug of war | hides multidimensional leverage | specify opposing instruments |
| great game | historical cosplay | describe the actual network |

UA warning equivalents:

```text
геополітична шахівниця
хід у геополітичній грі
демонстрація сили
завдає удару у відповідь
попереджувальний постріл
битва за ресурси
війна за ресурси
велика гра
перетягування каната
```

---

## 27.3 Anthropomorphized countries

| Avoid | Why | Replace with |
|---|---|---|
| Europe wakes up | continent is not an actor | name EU institution/member states/firms |
| China wants | actor ambiguity | name government, regulator, company, sector |
| markets fear | vague collective mind | identify price/risk indicator |
| industry believes | undefined population | identify companies/association/survey |
| Washington decided | institutional ambiguity | name administration/agency/Congress |
| Brussels wants | institutional ambiguity | name Commission/Council/Parliament |

Countries may be used as shorthand only when the institutional meaning is obvious and the shorthand does not distort agency.

---

## 27.4 Control language

High-risk phrases:

```text
controls
owns the market
has the world by the throat
tightens its grip
stranglehold
monopoly
weaponizes everything
can shut down X at will
```

These often convert concentration into omnipotence.

Before using `controls`, answer:

1. exact node?
2. market share/capacity?
3. alternatives?
4. substitution horizon?
5. enforcement mechanism?
6. ability to deny access?
7. cost of exercising leverage?

Prefer:

> China accounts for a highly concentrated share of this processing stage, giving it substantial near-term leverage where substitutes remain limited.

Not:

> China controls the world's rare earths.

---

## 27.5 Words that hide the missing model

These words are allowed, but every use should trigger a structural question.

### influence

**Where? Through what mechanism?**

### dominance

**Measured by what: capacity, market share, technology, finance, standards, or access?**

### pressure

**What cost, restriction, risk, or choice changed?**

### tensions

**Did any flow or rule actually change?**

### concerns

**Whose concerns, evidenced how, with what consequence?**

### ambitions

**Observed policy/capital allocation or inferred motive?**

### strategic

**Strategic for which objective and because of which dependency?**

### critical

**Critical by what threshold or function?**

### resilience

**Against which disruption? Over what time? At what cost?**

### security

**Supply security? National security? Energy security? Data security? Be specific.**

### decoupling

**Which flows actually separated?**

### de-risking

**Which exposure decreased?**

### diversification

**Did concentration actually fall, or were suppliers merely added?**

### independence

**From which dependency and at which stage?**

### sovereignty

**Operational capability or political slogan?**

### self-sufficiency

**At what scale and with which imported inputs?**

---

# 28. Consultant fog

Avoid sentences that sound meaningful but cannot be falsified.

Bad:

> Companies must navigate an increasingly complex geopolitical landscape.

Bad:

> The evolving environment presents both risks and opportunities.

Bad:

> Stakeholders will need to remain agile.

Bad:

> This underscores the importance of resilient supply chains.

Bad:

> The situation remains fluid.

Replace with a concrete observation.

If nothing concrete can replace it, delete the sentence.

UA equivalents to distrust:

```text
в умовах мінливого геополітичного середовища
створює як ризики, так і можливості
необхідно залишатися гнучкими
підкреслює важливість стійкості
ситуація залишається динамічною
```

---

# 29. Prediction fog

Avoid pseudo-forecasting.

Bad:

> This is likely to reshape global trade for years to come.

Better:

> If the rule remains in force, firms have a stronger incentive to move final assembly inside the eligible market.

Bad:

> The move could have far-reaching consequences.

Better:

> The immediate effect is on licensing time; downstream production effects are not yet visible.

WSB should state conditions and transmission mechanisms rather than perform prophecy.

---

# 30. Motive claims

Do not infer hidden motive when observable incentives are sufficient.

Bad:

> China is trying to destroy European competition.

Better:

> The measure raises European firms' input costs and increases the value of alternative processing capacity.

Bad:

> The EU wants to contain China.

Better:

> The rule limits eligibility for products that fail the specified origin conditions.

Describe effects first.

Attribute motives only when supported by explicit statements or strong evidence.

---

# 31. Weapon metaphors

Use `weaponized interdependence` as an analytical concept carefully.

Do not call every tariff, dependency or restriction a “weapon.”

Before using weapon language, identify:

- network position;
- dependency;
- instrument;
- coercive or denial mechanism;
- target;
- intended/observed effect.

Otherwise use:

```text
constraint
restriction
instrument
leverage
access condition
```

---

# 32. False precision

Do not create fake scales merely because the database allows them.

Bad:

```text
China leverage score: 83/100
```

unless a defensible methodology exists.

Prefer:

```text
LEVERAGE: HIGH ↑
confidence: high
mechanism: concentrated refining + slow substitution
```

A categorical assessment with transparent evidence is better than invented decimal rigor.

---

# 33. False balance

Uncertainty does not require pretending all claims have equal evidentiary weight.

If evidence strongly supports one interpretation:

> Available capacity data support X; claims of Y are not supported by comparable evidence.

Do not write:

> Some say X, while others say Y.

unless the disagreement itself matters and both positions are properly sourced.

---

# 34. Political neutrality

WSB describes political and policy actions through their system effects.

It does not endorse:

- governments;
- parties;
- leaders;
- geopolitical blocs;
- sanctions;
- tariffs;
- industrial policy;
- deregulation;
- protectionism;
- globalization;
- deglobalization.

The analytical question is:

> **What changed in flows, dependencies, constraints, leverage, rents, and adaptation?**

Normative judgment belongs outside the core Ledger unless explicitly attributed to a source.

---

# 35. Company language

Do not convert company PR into system fact.

Company says:

> This project will secure Europe's supply chain.

WSB writes:

> The company says the project is intended to improve supply security. At announced capacity, it would cover X if fully operational; current dependency is unchanged.

Distinguish:

```text
announced
financed
permitted
under construction
commissioned
operational
operational at material scale
```

---

# 36. Source language

Avoid:

> According to reports...

Prefer the source.

When several sources support the same factual statement, synthesize rather than produce attribution clutter.

Source quality should affect confidence, not prose theatrics.

Primary evidence is preferable when available for:

- regulation;
- tariffs;
- company investment;
- capacity;
- official statistics.

High-quality reporting remains important for:

- context;
- implementation;
- market response;
- inaccessible primary evidence.

---

# 37. Noise Check language

Noise Check should be mildly ruthless but never snide.

Template:

```text
NOISE CHECK

EVENT
[what happened]

TESTED
[which system dimensions]

RESULT
NO MATERIAL Δ / DEVELOPING / STRUCTURAL Δ

WHY
[one compact mechanism-based explanation]
```

Example:

> The summit generated new political language but no change in export controls, market access, or substitution capacity. Ledger state unchanged.

UA:

> Саміт приніс нові політичні формулювання, але не змінив експортні обмеження, доступ до ринку чи можливості заміщення. Стан Ledger без змін.

---

# 38. Social posts

A WSB social post should contain one structural fact.

Preferred form:

```text
◈ RARE EARTHS

New EU capacity:
adaptation PLANNED ↑

Current dependency:
HIGH →

Why:
the announced plant is not yet operational at material scale.

[link]
```

Do not convert social distribution into clickbait.

No:

> 🚨 HUGE DEVELOPMENT: Europe finally breaks China's grip!

The symbols are information, not decoration.

---

# 39. Alerts

Alerts should report state change, not news presence.

Bad:

> New article about semiconductors.

Good:

> × ADVANCED PACKAGING  
> Substitutability: LOW → MEDIUM  
> First material alternative capacity verified.

Bad:

> Breaking: new sanctions announced.

Good:

> § FINANCIAL ACCESS  
> New restriction closes a previously active payment route.

---

# 40. Daily opening

Avoid generic openings:

> It was another busy day in global markets...

> Geopolitical tensions continued to dominate...

> The global economy faces growing uncertainty...

Prefer:

> Three system lines changed materially today. Two involved market access; one involved physical capacity.

Or begin directly with SYSTEM DELTA.

---

# 41. Daily closing

Do not end with generic futurism.

Bad:

> Only time will tell how these developments play out.

Bad:

> The world will be watching closely.

Prefer a **watch condition**:

> Next test: whether announced alternative refining capacity reaches commissioning before licensing constraints materially reduce downstream inventories.

A good closing tells the reader **what evidence would change the Ledger next**.

---

# 42. Watch conditions

Every developing story should ideally have an observable next condition.

Examples:

```text
WATCH:
commercial commissioning

WATCH:
customs data showing rerouted flow

WATCH:
licence approval time

WATCH:
capacity utilization

WATCH:
rule enters into force

WATCH:
first cargo through alternative route
```

This turns “what happens next?” into a falsifiable observation.

---

# 43. Editorial hierarchy

When choosing among candidate Δs, prefer:

1. change in a high-dependency relation;
2. emergence/removal of a binding constraint;
3. meaningful leverage change;
4. operational substitution;
5. bottleneck migration;
6. rent migration with system consequences;
7. new evidence that reverses prior WSB state.

Prefer less:

- speeches;
- announcements without implementation;
- political theatre;
- price movement without structural mechanism;
- repetitive sanctions coverage without changed access;
- forecasts without new evidence.

---

# 44. LLM drafting contract

An LLM drafting WSB copy must receive structured Ledger context before writing.

Minimum input:

```text
event
previous state
current state
Δ
evidence
confidence
watch condition
language
```

The LLM must not invent:

- additional Δs;
- motives;
- numbers;
- causal mechanisms;
- historical comparisons;
- substitution horizons;
- actors.

If information is missing, the draft should expose the gap rather than fill it with plausible prose.

Bad LLM behavior:

> transform sparse data into confident narrative.

Desired behavior:

> transform structured analysis into readable language while preserving uncertainty.

---

# 45. LLM anti-cliché check

Before accepting generated copy, automatically flag phrases matching the anti-lexicon.

A flag does not always mean deletion.

It means:

> **prove this phrase earns its place.**

Potential lint categories:

```text
DRAMA
GEOPOLITICAL_THEATRE
ANTHROPOMORPHISM
UNSCOPED_CONTROL
MISSING_BASELINE
VAGUE_CAUSALITY
CONSULTANT_FOG
PREDICTION_FOG
MOTIVE_INFERENCE
FALSE_PRECISION
TRANSLATION_DRIFT
```

This should eventually become an editorial linter.

---

# 46. LLM fingerprints are editorial defects

WSB may use LLMs extensively in research, extraction, synthesis, translation support, and drafting.

That does **not** grant LLM rhetoric a place in the published voice.

A sentence can be factually correct, structurally sound, and still fail editorial review because it reads like generic machine-generated prose.

Treat recognizable LLM stylistic fingerprints as editorial defects.

The problem is broader than factual hallucination. It includes repeated rhetorical habits such as:

- formulaic contrast structures used by default rather than because the thought requires them;
- mechanically balanced clauses and symmetrical triads;
- generic scene-setting and throat-clearing;
- synthetic transitions that merely announce the next paragraph;
- repeated "not X, but Y" constructions;
- automatic recap sentences that restate the paragraph without adding information;
- canned emphasis and pseudo-insight;
- unnecessary meta-language about what is "important", "notable", "key", or "worth noting";
- generic explanatory padding between facts;
- predictable conclusion formulas;
- uniform sentence rhythm that makes unrelated sections sound generated by the same machine;
- stock LLM vocabulary or syntax that survives because it is fluent rather than because it is exact.

Examples of suspicious constructions include, depending on context:

~~~text
It is important to note that...
It is worth noting that...
The key takeaway is...
At its core...
This is not just X; it is Y.
The story is not X. It is Y.
What matters here is...
The broader picture is...
This highlights...
This underscores...
Taken together...
In other words...
Ultimately...
The question is not whether X, but Y.
Rather than X, this is about Y.
~~~

These are not universally forbidden strings. They are fingerprints requiring justification.

The editorial test is:

> **Would a strong human editor, with this evidence and this model, naturally choose this construction here — or is the model reaching for a familiar rhetorical mold?**

If the latter, rewrite.

Do not solve LLM voice by adding random slang, eccentric punctuation, fake informality, deliberate grammatical damage, or arbitrary stylistic variation. Human voice is not noise injected into machine prose.

The desired process is:

~~~text
LLM draft
   ↓
fact / Δ / scope check
   ↓
anti-lexicon check
   ↓
LLM-fingerprint check
   ↓
human editorial rewrite
   ↓
WSB voice
~~~

The final text may be elegant, literary, compressed, dry, surprising, or stylistically ambitious.

What it must not be is **recognizably generic generated prose**.

## Authorial corpus

WSB may maintain a curated corpus of human-written text representing the desired expressive range of the publication.

This corpus is not a phrase bank to imitate mechanically.

Its purpose is to learn and test:

- sentence rhythm;
- compression;
- transitions;
- preferred levels of explicitness;
- tolerance for irony;
- density;
- vocabulary;
- ways of opening and closing;
- characteristic ways of explaining difficult mechanisms;
- constructions the editor naturally avoids.

The corpus must never override factual precision, Ledger semantics, uncertainty, source attribution, or EN/UA semantic parity.

A useful future editorial linter category:

~~~text
LLM_FINGERPRINT
~~~

The standard is deliberately severe:

> **If the prose advertises the machinery that generated it, the prose is not finished.**

---

# 48. Translation workflow

Preferred workflow:

```text
Ledger state
   ↓
language-neutral editorial brief structure
   ↓
EN draft ──┐
           ├── semantic parity QA
UA draft ──┘
   ↓
publication
```

Do not treat UA as a mechanical post-processing translation of final EN prose.

Both versions should be generated from the same structured analytical object.

This reduces translation drift.

---

# 47. Editorial QA checklist

Before publication, ask:

### Structure

- What exactly changed?
- Compared with when?
- Which relation/node changed?
- Is this an event or a Δ?
- Did a bottleneck disappear or move?
- Is the bypass material at scale?

### Evidence

- What supports the claim?
- Is the source primary where possible?
- Is causal language justified?
- Is uncertainty visible?

### Language

- Any anti-lexicon warning?
- Any actor anthropomorphized?
- Any vague “influence/dominance/pressure”?
- Any adjective replacing a measurement?
- Any generic closing sentence?

### Bilingual parity

- Same Δ in EN and UA?
- Same confidence?
- Same causal strength?
- Same time horizon?
- Same numbers?
- Same conditionality?

---

# 49. A small WSB phrasebook

## EN

Preferred:

```text
remains unchanged
became binding
moved downstream
shortened the substitution horizon
created a partial bypass
increased market-access leverage
reduced route flexibility
added capacity without yet changing dependence
evidence remains insufficient
direction is clear; magnitude is uncertain
```

## UA

Preferred:

```text
залишається без змін
стало критичним обмеженням
змістилося нижче ланцюгом
скоротило горизонт заміщення
створило частковий обхід
посилило важелі впливу на доступ до ринку
зменшило гнучкість маршрутів
додало потужності, але поки не змінило залежність
доказів поки недостатньо
напрям зміни зрозумілий, масштаб залишається невизначеним
```

---

# 50. Canonical editorial tests

## Test 1 — announcement

Input:

```text
new plant announced
no current production
```

Fail:

> Europe reduces its dependence.

Pass:

> Europe gained a planned alternative source; current dependence is unchanged.

---

## Test 2 — localization

Input:

```text
Chinese EV maker opens EU assembly
Chinese components remain dominant inputs
```

Fail:

> Chinese dependence falls.

Pass:

> Finished-vehicle import exposure falls, while component dependence remains.

---

## Test 3 — shipping risk

Input:

```text
insurance + freight ↑
throughput →
```

Fail:

> Hormuz disruption cuts supply.

Pass:

> Hormuz risk increased shipping costs before materially reducing physical flow.

---

## Test 4 — summit

Input:

```text
major political meeting
no rule/access/capacity change
```

Fail:

> A landmark reset reshapes relations.

Pass:

> Political language changed; the tracked system relations did not.

---

# 51. The anti-bullshit invariant

Every important WSB sentence should answer at least one of these:

```text
WHAT MOVED?
WHAT BECAME MORE/LESS DEPENDENT?
WHERE IS THE CONSTRAINT?
WHOSE OPTIONS CHANGED?
WHO CAPTURES THE RENT?
WHAT CAN SUBSTITUTE IT?
HOW LONG WOULD SUBSTITUTION TAKE?
WHERE DID THE BOTTLENECK MOVE?
WHAT EVIDENCE WOULD CHANGE OUR VIEW NEXT?
```

If a sentence answers none of them, ask why it exists.

---

# 52. Final discourse rule

WSB should make the world **more legible**, not more dramatic.

The product wins when the reader can say:

> “I understand which relationship changed, why it matters, what did not change, and what evidence would make us revise the model.”

Not:

> “That sounded important.”

---

# 53. Editorial motto

> **FACTS · STRUCTURE · CONNECTIONS · CONSEQUENCES · NOT NOISE**

And the internal version:

> **No geopolitics by adjective.**

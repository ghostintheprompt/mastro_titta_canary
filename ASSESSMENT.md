# Security Assessment

## Objective

Assess what a link-preview endpoint can observe, model the trust boundaries in
the request path, and define a test that produces useful evidence without
mistaking a request for a person.

This review covers the scenario described in the repository and the synthetic
records in [`fixtures/synthetic_observations.json`](fixtures/synthetic_observations.json).
It does not verify the private implementation, the family incident, or the
behavior of a live messaging platform.

## Request path

1. A test participant or client shares an image link.
2. The messaging application may request page metadata or the image itself.
3. Preview services, caches, relays, and proxies may fetch, transform, or
   repeat those requests.
4. The endpoint records the request fields exposed by the hosting path.
5. An analyst compares observed events with the test plan and controls.

The endpoint sees the request that reached it. It does not inherently see who
initiated the fetch, whether anyone viewed the resulting image, or the intent
behind the event.

## Trust boundaries

- **Client to messaging service:** user-agent and client hints are
  client-supplied and may be changed or omitted.
- **Messaging service to endpoint:** automated previews and retries can look
  like additional activity.
- **Network to endpoint:** addresses can represent shared gateways, proxies,
  relays, or infrastructure.
- **Record to analyst:** derived labels require validated rules and disclosed
  uncertainty.
- **Analyst to conclusion:** matching and differing fields do not uniquely
  identify or distinguish people.

## Synthetic evidence review

The fixture uses documentation-only IPv4 addresses and fabricated client
strings. It is a set of test examples, not captured traffic.

| Records | Observed in fixture | Supported | Not established |
|---|---|---|---|
| `synthetic-001` | One example preview-image event. | The fixture represents one event with the stated fields. | A person caused it or saw the image. |
| `synthetic-001` and `synthetic-002` | Same client string; different example network values. | The strings and values compare as stated. | Same person, different person, device continuity, or concealment. |
| `synthetic-003` | Different example path and client string. | A separate fixture event is represented. | That it is related to either earlier event. |

No attribution follows from these examples.

## Findings

### F-1: A fetch does not establish a view

**Impact:** Counting preview requests as human opens inflates engagement and
can send an investigation in the wrong direction.

**Test implication:** Exercise page metadata fetch, image fetch, cache hit,
retry, and direct-open paths separately. Report each as a request event.

### F-2: Network and client fields are not identity keys

**Impact:** A shared or changing network can split one actor into multiple
records; a copied or generic client string can merge unrelated actors.

**Test implication:** Use these fields only to test a documented technical
hypothesis. Do not use them as a person or device identifier.

### F-3: Labels need evidence and provenance

**Impact:** “Human,” “bot,” “anonymous,” and “suspicious” can turn an uncertain
signal into a verdict.

**Test implication:** Keep observation, transformation, inference, and
unknowns separate. Store the rule and input fields behind each derived label.

## Assessment conclusion

The useful red-team question is not “who is this?” It is “which component made
this request, under what test condition, and what does the endpoint actually
know?” The deployment design turns that question into repeatable cases,
bounded collection, and measurable acceptance criteria.

## Authorization

Every live exercise needs written scope for the environment, methods,
participants or systems, dates, data handling, and stop condition. A blind
exercise can keep exact timing or scenario details from participants when the
engagement rules cover that approach. It does not extend scope to uninvolved
people or infrastructure.

The operator must account for hosting-provider logs as well as application
logs. Domain ownership is not blanket visitor authorization. Notice, consent,
privacy, and communications requirements depend on the deployment and
jurisdiction; obtain qualified review for the actual test.

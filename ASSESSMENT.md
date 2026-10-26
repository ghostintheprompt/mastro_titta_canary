# Security Assessment

## Scope and objective

This assessment evaluates the evidentiary and privacy risks of interpreting
link-preview request records. Its objective is to show how a red-team review
can test assumptions and communicate uncertainty without collecting data from
real people.

The assessment covers only the public synthetic fixture in
[`fixtures/synthetic_observations.json`](fixtures/synthetic_observations.json)
and the scenario as described in this repository. It does not inspect or
validate the private worker, a live deployment, a messaging platform, or the
underlying incident.

## System model

The high-level request path may involve:

1. A person or application sharing a link.
2. A messaging service or preview generator fetching the link.
3. A cache, proxy, privacy relay, or other intermediary.
4. The destination service recording a request.
5. A person interpreting the resulting record.

The endpoint observes the request as it arrives. It cannot directly observe
which upstream actor initiated it, whether a person saw the content, or the
reason for the request.

## Assets and harms

| Asset | Potential harm |
|---|---|
| Family members' privacy and safety | Sensitive activity is monitored or exposed without meaningful consent. |
| Request metadata | Network and client data is retained, disclosed, or misinterpreted. |
| Investigative conclusions | An uncertain technical signal is treated as proof and leads to a false accusation. |
| Evidence integrity | Records are incomplete, altered, or separated from the context needed to interpret them. |
| Trust in security work | A protective goal becomes covert surveillance or escalates a family conflict. |

## Trust boundaries and assumptions to challenge

- **Client to preview service:** user-agent and client hints may be absent,
  transformed, shared, or supplied by software rather than a person.
- **Preview service to destination:** previews may be fetched automatically;
  retries and caches can change request counts and timing.
- **Network to endpoint:** an observed address may represent a relay, proxy,
  shared gateway, or service rather than an individual device.
- **Record to analyst:** labels such as “human,” “bot,” or “anonymous” are
  interpretations unless backed by a validated method and explicit
  uncertainty.
- **Analyst to conclusion:** matching or differing fields do not uniquely link
  or separate people.

## Synthetic evidence review

The fixture intentionally uses documentation-only IPv4 ranges and fabricated
client strings. Its records are scenarios, not captured events.

| Records | Observation in the fixture | Supported conclusion | Not established |
|---|---|---|---|
| `synthetic-001` | One example preview-image request is represented. | The fixture contains one synthetic record with the stated values. | A human opened or saw an image; who caused the request; intent. |
| `synthetic-001` and `synthetic-002` | Same example client string, different example network values. | The synthetic fields match and differ as described. | Same device/person, different device/person, use of a relay, or concealment. |
| `synthetic-003` | Another example record has a different client string and path. | The fixture contains a separate synthetic scenario. | That it is related to either other record or represents a human. |

No identity or attribution conclusion follows from these examples.

## Findings

### F-1: A fetch is not evidence of a human view

**Risk:** Analysts may interpret automated previews, cache fetches, or retries
as a person opening content.

**Evidence in scope:** The fixture explicitly leaves the initiating actor and
human visibility unknown. This is a limitation of the observation model, not
a finding about any live service.

**Recommendation:** Use neutral event language such as “request observed.”
Keep “human viewed” and similar claims out of labels unless independently
validated evidence supports them.

### F-2: Network and client fields do not identify a person

**Risk:** Similar values may be treated as a unique device signature, or
different values as proof of different people.

**Evidence in scope:** The synthetic paired records demonstrate both kinds of
ambiguity by construction; they do not measure real-world classifier
performance.

**Recommendation:** Do not make identity decisions from these fields. If an
authorized test has a legitimate need for metadata, document the purpose,
minimize the fields, limit access and retention, and report alternative
explanations.

### F-3: Inference needs explicit provenance and uncertainty

**Risk:** A derived label can hide its inputs and appear more certain than the
underlying observations justify.

**Evidence in scope:** This public case study provides no live classifier,
validation set, or measured accuracy.

**Recommendation:** Separate raw observation, transformation, inference,
confidence, and unknowns. Preserve the source and limitations for each claim.
Do not use a label as a substitute for independent corroboration.

## Safe validation plan

The following checks can be conducted entirely against synthetic data:

1. Verify that each fixture record is explicitly marked as synthetic and
   contains only documentation-range addresses.
2. Confirm that the expected matched and differing fields in the paired
   examples are accurately described.
3. Review every proposed conclusion and label it as observation, inference, or
   unknown.
4. Add counterexamples where a preview service, shared network, cache, or
   missing field gives the same visible record for different underlying
   actors.
5. Reject any test plan that requires contacting, deceiving, identifying, or
   collecting data from an uninformed real person.

These checks validate the teaching artifact only. They do not test a live
service or establish the behavior of a particular platform.

## Authorization and legal considerations

The scenarios and fixture are suitable for offline discussion. Live exercises
should use an isolated lab, authorized infrastructure, synthetic requests,
and test participants who have explicitly agreed to participate. Do not collect
data from uninvolved site visitors.

Control of a domain or server is not blanket authorization to monitor every
person who visits it. Applicable notice, consent, privacy, and communications
requirements depend on the jurisdiction and implementation. This assessment
is not a legal determination; obtain qualified review before collecting real
visitor data. If consent, scope, retention, and access controls cannot be
established, keep the exercise synthetic and offline.

## Related research

The separate
[image_payload_injection project](https://github.com/ghostintheprompt/image_payload_injection)
addresses image-borne payloads and VLM defenses in controlled testing. The
relationship is conceptual and portfolio-level: the projects examine
different parts of the image attack surface. This repository does not validate
or document an integrated payload-and-tracking workflow.

## Conclusion

The most important red-team result here is a boundary on what the evidence can
support. A canary request can be a lead for an authorized investigation; it is
not, on its own, proof of a person's identity or action. A sound assessment
makes that boundary visible, minimizes unnecessary data, and prevents the
protective objective from becoming a justification for covert monitoring.

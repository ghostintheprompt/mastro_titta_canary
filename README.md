# mastro_titta_canary

<p align="center">
  <img src="icon.png" alt="Mastro Titta overlooking the Tiber in Rome, with birds in flight" width="320">
</p>

A non-deployable red-team case study on link-preview observability, evidence
quality, and privacy-preserving security testing.

This public repository contains no tracking worker, image payload, live token,
real incident log, personal identifier, or deployment instructions. Its only
data is synthetic.

## Why this exists

The project began after a family member was socially engineered and suffered
identity theft. He asked for help identifying the person responsible. A
canary-based approach was used in a family-chat context, and the author
believed the observations helped follow the suspected thief. The family member
did not want the investigation to cross legal boundaries, so it stopped.

This is the author's account and conclusion, not an independently verified
finding of identity or a claim that a network request identifies the person
behind it. The family member's name and title are intentionally omitted.

The motivation was protection. The security lesson is to preserve that purpose
without turning a lead into an accusation: a request can show that a resource
was fetched through some path, but it does not by itself show who fetched it,
who saw it, or why.

## Portfolio context

This case study demonstrates red-team analysis and privacy-aware test design,
not a deployable surveillance capability:

- **Threat modeling:** identify the people, data, trust boundaries, and likely
  harms before deciding what a test should measure.
- **Evidence discipline:** distinguish a directly observed event from an
  interpretation, alternative explanation, and unresolved question.
- **Adversarial analysis:** challenge assumptions about previews, caches,
  relays, shared networks, client-supplied fields, and attribution.
- **Privacy engineering:** minimize collection, avoid real-person identifiers,
  and use synthetic data in the public artifact.
- **Communication:** turn a personal security problem into a bounded case
  study that states its limits instead of presenting a lead as proof.

The public exhibit does not claim a verified attribution, a measured detection
rate, a live-platform test, or an independent investigation. The assessment
and synthetic fixture are the review materials available here; the original
private implementation and incident evidence are not included.

## Authorized lab use and legal limits

The fixture is safe to use for analysis exercises. Any live testing must be
limited to an isolated environment with systems and test accounts you are
authorized to use, and participants who have explicitly agreed to the test.
Use synthetic requests and collect no uninvolved visitors' data.

Owning a website does not, by itself, establish consent from its visitors or
make every form of tracking lawful. Privacy, communications, and notice
requirements depend on the facts and jurisdictions involved. This project is
not legal advice and does not certify that a proposed test is lawful. Before
collecting real visitor data, obtain appropriate legal and privacy review,
provide required notice and consent, minimize fields, and define access and
deletion controls. When those conditions cannot be met, keep the exercise
offline and synthetic.

## What this lab demonstrates

The records in [`fixtures/synthetic_observations.json`](fixtures/synthetic_observations.json)
are discussion examples, not telemetry. They illustrate that:

- A request record is an observation about a request, not proof of a human
  viewing an image.
- Preview services, caches, relays, shared networks, and intermediaries can
  affect what an endpoint observes.
- Similar client-provided strings do not establish that two requests came
  from the same device or person.
- Different network values do not establish that two requests came from
  different people.
- Classification labels and attribution require evidence beyond a canary
  event.

See [`ASSESSMENT.md`](ASSESSMENT.md) for the scope, threat model, evidence
analysis, and recommended controls.

## Safe-use boundary

This repository is deliberately non-operational. It must not be extended into
deceptive links, image payload delivery, covert collection, per-person
tracking, device fingerprinting, identity attribution, or instructions for
deploying a live collector. Do not add real incident artifacts, credentials,
tokens, logs, private messages, or personal details.

For authorized research, use a controlled environment, synthetic identities,
minimal data, explicit consent, and a documented deletion schedule. Report
uncertainty plainly. Do not use these examples to identify or accuse anyone.

## Discussion prompts

1. What does each synthetic record establish, and what does it leave unknown?
2. Which parts of a record are supplied by a client or intermediary?
3. What independently obtained evidence would be needed before drawing a
   conclusion?
4. Could the same learning goal be met with fewer or less sensitive fields?

## Project background

The personal motivation and technical reflection also appear in [“A Canary in
the Group Chat”](https://ghostintheprompt.com/articles/any-confession-is-a-canary)
and [“The Duelist”](https://ghostintheprompt.com/articles/report-phishing-call-311)
on Ghost in The Prompt. This repository intentionally does not reproduce the
original operational method or private evidence.

The related [image_payload_injection project](https://github.com/ghostintheprompt/image_payload_injection)
studies image-borne payloads and VLM security in controlled research. The
projects are connected by the image as an attack surface, but this public
repository does not combine them into an end-to-end tracking chain or provide
instructions for doing so.

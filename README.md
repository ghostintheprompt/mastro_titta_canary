# mastro_titta_canary

A non-deployable case study about canary observations, evidence limits, and
privacy-preserving security testing.

This project contains no tracking worker, image payload, live token, real
incident log, personal identifier, or deployment instructions. The examples
are synthetic and are not collected from people or services.

## Why this exists

The project began after a family member was socially engineered and suffered
identity theft. He asked for help identifying the person responsible. A
canary-based approach was used in a family-chat context, and the author
believed the observations helped follow the suspected thief. The family member
did not want the investigation to cross legal boundaries, so it stopped.

This is the author's account and conclusion, not an independently verified
finding of identity or a claim that a network request identifies the person
behind it. The family member's name and title are intentionally omitted.

The motivation was protection. The lesson is to preserve that purpose without
turning a lead into an accusation: a request can show that a resource was
fetched through some path, but it does not by itself show who fetched it, who
saw it, or why.

## What this lab demonstrates

The synthetic records in [`fixtures/synthetic_observations.json`](fixtures/synthetic_observations.json)
are discussion material, not telemetry. They illustrate that:

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
3. What additional, independently obtained evidence would be needed before
   drawing a conclusion?
4. Could the same learning goal be met with fewer or less sensitive fields?

## Project background

The personal motivation and technical reflection were also written about in
“A Canary in the Group Chat” and “The Duelist” on Ghost in The Prompt. This
repository intentionally does not reproduce the original operational method
or private evidence.

<p align="center">
  <img src="icon.png" alt="Mastro Titta above the Tiber in Rome, with birds over the bridge" width="360">
</p>

# mastro_titta_canary

**Authorized red-team testing for image-link request paths and the evidence they produce.**

## Why I built it

An older family member was socially engineered and suffered identity theft.
He asked me to help identify the person responsible. I put a canary in an
Alessandro Nesta image shared in a private chat and watched the requests reach
the endpoint. I believed the trail led to the thief. He told me not to break
the law. I stopped.

His name and title stay private. The account is mine; the attribution was not
independently verified.

## What the work tests

An image link crosses several trust boundaries: the sharing client, the
messaging service, preview infrastructure, caches or relays, and the endpoint.
This project examines what each request path reveals, how those observations
can be tested, and where the evidence stops.

The [synthetic fixture](fixtures/synthetic_observations.json) gives reviewers
known inputs. The [assessment](ASSESSMENT.md) records the threat model and
evidence analysis. The [deployment design](DEPLOYMENT_DESIGN.md) turns that
analysis into a controlled test architecture, including an isolated image
payload test against an in-scope VLM.

## Current status

The public repository contains the case study, synthetic fixture, and
deployment design. It does not yet contain a deployable collector or claim
results from a live platform. The next implementation should meet the
acceptance criteria in the deployment design before its behavior is described
as verified.

## Operating scope

Run live tests under written authorization with a named environment, test
window, approved participants or systems, and a defined stop condition. A
blind exercise can preserve realism when the engagement authorizes it and
participants are covered by the exercise rules. The collector is designed to
record test events, not build identities from people.

Domain ownership alone does not authorize monitoring every visitor. Define
notice, consent, data handling, and applicable legal review for the actual
deployment and jurisdiction before collecting real visitor data.

## Related work

[image_payload_injection](https://github.com/ghostintheprompt/image_payload_injection)
tests image-borne payloads and VLM defenses. This project covers the request
and evidence side. The deployment design joins those test surfaces only inside
an isolated, authorized lab.

## Background

The personal account and the motivation behind this work are explained in
[“A Canary in the Group Chat”](https://ghostintheprompt.com/articles/any-confession-is-a-canary)
and [“The Duelist”](https://ghostintheprompt.com/articles/report-phishing-call-311).

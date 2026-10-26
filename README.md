<p align="center">
  <img src="icon.png" alt="Mastro Titta above the Tiber in Rome, with birds over the bridge" width="360">
</p>

# mastro_titta_canary

**A red-team case study in image links, request evidence, and attribution.**

## Why I built it

My dad was socially engineered and had his identity stolen. He asked me to
catch the person responsible. I put a canary in an Alessandro Nesta image
shared in our family chat and watched the requests reach the endpoint. I
believed the trail led to him. Dad told me not to break the law. I stopped.

His name and title stay private. My account of the trail is not independently
verified attribution.

## What the records can show

A request shows that a client or intermediary reached an endpoint. It does
not identify who caused the request, establish that someone saw the image, or
show intent. Preview services, caches, relays, shared networks, and
client-supplied fields all affect how a request should be read.

The [synthetic fixture](fixtures/synthetic_observations.json) gives reviewers
examples to reason through. The [assessment](ASSESSMENT.md) lays out the
request path, trust boundaries, and evidence limits. The examples are invented;
they are not incident records. I have not tested how a live platform handles
these requests or independently verified an identity.

## Red-team work

This write-up records my review of the request path, the telemetry's
assumptions, and the gap between an observation and an attribution. The private
implementation, image, and incident records are not in this repository.

## Scope

The fixture is for offline analysis. Live testing requires authorized systems,
synthetic requests, and participants who agreed to take part. Site ownership
alone does not establish visitor consent or determine whether tracking is
lawful. Requirements vary by test and jurisdiction; get qualified privacy and
legal review before collecting visitor data. I have not assessed the legality
of any specific deployment.

## Related work

[image_payload_injection](https://github.com/ghostintheprompt/image_payload_injection)
tests image-borne payloads and VLM defenses. This case study examines the
request evidence that can follow an image share. The public projects do not
join those parts into a live tracking chain.

The personal account and technical reflection also appear in
[“A Canary in the Group Chat”](https://ghostintheprompt.com/articles/any-confession-is-a-canary)
and [“The Duelist”](https://ghostintheprompt.com/articles/report-phishing-call-311).

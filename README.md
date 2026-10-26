<p align="center"><img src="icon-v2.png" alt="Hooded Mastro Titta beside the Tevere, axe at rest, with Rome and canaries at dusk" width="480"></p>

# Mastro Titta Canary

### Silenzio. The ledger is open.

I keep an axe beside the Tevere. It has excellent uptime. The paperwork takes longer.

An image is fetched twice. I enter two requests. Anyone demanding two culprits can take a number.

**Prototype in active development.** The public checkout currently contains the assessment, deployment design, synthetic observations and new artwork. A runnable local collector and operator console are being tested before the implementation lands here. No production deployment or live messaging-platform result is claimed.

## Social engineer the social engineer

Alessandro Nesta. For me, the greatest defender the Azzurri have had. I used his photo in his honor, and because I knew il vecchio and the thief would both want to open it.

That was the bait. It worked.

Someone had socially engineered a person I love. I chose something both men would recognize and want to see, put the canary behind the image link, and followed the requests. The choice of photograph was part of the method. Social engineering has an audience, even when the audience thinks it is running the show.

The full account, the trail I followed, the conversations with police, and the challenge to Google are in [“The Duelist”](https://ghostintheprompt.com/articles/report-phishing-call-311). [“A Canary in the Group Chat”](https://ghostintheprompt.com/articles/any-confession-is-a-canary) covers the image-link side. The private photo and incident records stay private.

## On the workbench

The implementation under test runs on loopback, with an operator-only console and one revocable token per controlled run. Planned cases cover the metadata page, preview image, repeated fetch, callback route, stop, expiry and deletion. The callback records a request reaching its handler. VLM causation still needs independent evidence.

Application events contain the run ID, event ID, route class, server timestamp, route version and test case. Source IP, forwarded-address headers, user-agent, precise location, device signatures and recipient maps stay out of that event schema.

The local prototype uses encrypted event storage, an authenticated console and private exports. Its default demonstration key sits beside the ciphertext; production key custody is separate work. The deployment design names further controls that need their own implementation and review.

## The clerk's rules

The ledger records what the handler saw. Identity, human viewing, attribution, provider action and victim outcome remain unknown unless separate evidence establishes them. Stop and expiry must prevent new collection. Retention must delete retained application records. An export keeps its unknowns attached.

This local prototype imports no email, submits no complaint to Google, and sends no payload to a model. The assessment separates request evidence from attribution.

For a live exercise, keep the environment, methods, test window, covered participants, handling rules and stop condition in the engagement scope. The public examples are synthetic. The older private implementation and its image are not part of this repository.

## Read the file before sharpening the axe

- [Assessment](ASSESSMENT.md): request paths, trust boundaries and the limits of attribution.
- [Deployment design](DEPLOYMENT_DESIGN.md): the target architecture and its acceptance criteria. Design requirements are not completed features.
- [Synthetic observations](fixtures/synthetic_observations.json): authored examples, including documentation-only network addresses. They are not collected visitor records.
- [Related image-payload work](https://github.com/ghostintheprompt/image_payload_injection): a separate VLM test surface, not an integration claimed by this prototype.

Implementation, test results and a runnable demonstration follow in the next code update. Until then, treat the repository as a development preview.

**GhostInThePrompt.com** // *Aò, stavorta abbocchi te.*

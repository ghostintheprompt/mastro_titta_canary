<p align="center"><img src="icon-v2.png" alt="Hooded Mastro Titta beside the Tevere, axe at rest, with Rome and canaries at dusk" width="480"></p>

# Mastro Titta Canary

### Silenzio. The ledger is open.

I keep an axe beside the Tevere. It has excellent uptime. The paperwork takes longer.

An image is fetched twice. I enter two requests. Anyone demanding two culprits can take a number.

**Prototype in active development.** The local collector and operator console now run, with automated and browser checks. Hosted deployment, messaging-platform behavior and VLM integration remain separate work.

## Social engineer the social engineer

Alessandro Nesta. For me, the greatest defender the Azzurri have had. I used his photo in his honor, and because I knew il vecchio and the thief would both want to open it.

That was the bait. It worked.

Someone had socially engineered a person I love. I chose something both men would recognize and want to see, put the canary behind the image link, and followed the requests. The choice of photograph was part of the method. Social engineering has an audience, even when the audience thinks it is running the show.

The full account, the trail I followed, the conversations with police, and the challenge to Google are in [“The Duelist”](https://ghostintheprompt.com/articles/report-phishing-call-311). [“A Canary in the Group Chat”](https://ghostintheprompt.com/articles/any-confession-is-a-canary) covers the image-link side. The private photo and incident records stay private.

## On the workbench

The implementation runs on loopback, with an operator-only console and one revocable token per controlled run. Tested routes cover the metadata page, preview image, repeated fetch, callback route, stop, expiry and deletion. The callback records a request reaching its handler. VLM causation still needs independent evidence.

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

## Open the desk

Node.js 22 or later. No package dependencies, hosted account, external fonts or analytics scripts.

```sh
npm test
npm run demo
npm start
```

The server prints its `http://127.0.0.1:PORT` address and a private operator token. Open that address, unlock the console, create a test run, and save its one-time link with your test plan. The page and image produce separate entries. Export the record, stop collection, and inspect the stopped route. Purge requires an explicit checkbox in the console.

`npm run demo` makes actual loopback HTTP requests and writes a private report plus acceptance record under `artifacts/`. It checks one metadata request, two image requests, one callback, stop rejection, export and purge. The synthetic observations in `fixtures/` remain a separate authored example. The callback route sends nothing to a model.

## Storage, keys and the gate

State defaults to `.mastro-state/`, excluded from Git. Events use AES-256-GCM with a private local key. A corrupted store fails startup. External edits block writes and preserve the changed file. A missing key does not generate a replacement over existing evidence.

For the local demonstration, the key and ciphertext are adjacent. Copying both defeats that storage separation. Set `MASTRO_STORE_KEY` to a base64-encoded 32-byte key managed separately for a deployment. `MASTRO_STATE_DIR` chooses another state folder. `MASTRO_ADMIN_TOKEN` can supply an operator secret of at least 24 characters; otherwise each server launch generates one. `PORT` selects the loopback port. Credentials never belong in source control.

The operator session expires after an hour. The console checks request origin, uses HttpOnly/SameSite cookies, and blocks unrecognized Host headers. A local single-writer lock prevents two servers sharing the same state directory. After a crash, verify the old process is gone before removing a stale `server.lock`. Do not remove the lock underneath a running server.

Default run window: 30 minutes. Default retention: 24 hours, configurable up to 14 days. Stop revokes further collection while retaining evidence for review. Purge or retention expiry removes the run and its application events. Pruning runs on access, startup and a one-minute timer while the server is running. A powered-off machine cannot execute that timer. Exports, backups, filesystem remnants and host/provider access logs need their own handling.

`private-archive/` holds older local materials, excluded by `.gitignore` and a local Git exclude rule. It is not served by the application and is not part of the public source. The old duplicate checkout has been consolidated into this folder.

## The record so far

[Recorded local demonstration](evidence/local-loopback-acceptance.json) · [Origin event report](evidence/local-loopback-report.json) · [Console screenshot](docs/console-desktop.png)


Fourteen automated test groups pass. The suite covers event fields, repeated requests, route/token rejection, stop, expiry, retention/reload, encryption/tampering, external edits, absent keys, capacity, operator access, cookies/origin, actual HTTP routes, Host checks, static content and single-writer behavior. The real browser check unlocked the console, created a run, opened the controlled page, displayed one page and one image event, exported JSON, stopped collection, and confirmed the route was inactive. Desktop and 390px mobile views were checked; the mobile document had no horizontal overflow.

A preview fetch earns an entry. Every claim after that needs its own evidence. The target deployment architecture remains in `DEPLOYMENT_DESIGN.md`; the localhost prototype does not implement provider integration or a production key-management service.

**GhostInThePrompt.com** // *Aò, stavorta abbocchi te.*

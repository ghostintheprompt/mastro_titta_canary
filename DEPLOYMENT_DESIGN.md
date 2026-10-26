# Deployment Design

## Goal

Build a deployable canary test service for authorized red-team exercises. It
will measure request-path behavior across a controlled image-link workflow and
support a separate, isolated image-payload test against an in-scope VLM.
The output is an event timeline for a test run, not an identity system.

This document defines the target implementation. It is not evidence that a
collector has been built or deployed.

## Engagement envelope

Each run starts with a written scope record containing:

- authorized hostnames, messaging applications, model endpoints, and test
  accounts;
- test owner, operator, approved participants or systems, and test window;
- permitted image and payload classes;
- fields the test needs to observe and why;
- storage location, access list, retention deadline, and deletion owner;
- stop conditions and an incident contact.

The exercise may be blind on timing or scenario details when the rules of
engagement explicitly cover that design. The environment and participant set
remain in scope. A family incident is not authorization for a new test.

## Components

1. **Run controller:** creates a random run identifier, loads the approved
   scope, and rejects expired or disabled runs.
2. **Test asset builder:** produces an inert preview image and metadata for the
   link-path cases. Image-payload cases use a separate test asset and are sent
   only to the in-scope VLM pipeline.
3. **Canary endpoint:** serves the test page and image routes. It records only
   events tied to an active run and a known route.
4. **Event store:** keeps the minimal event schema below with encryption at
   rest, authenticated operator access, and a fixed deletion deadline.
5. **Report generator:** compares events with the run plan and exports a
   timeline with observations, test conditions, and unresolved questions.
6. **Stop control:** disables a run immediately, invalidates its route tokens,
   and prevents further collection.

## Event schema

Application records contain only:

| Field | Purpose |
|---|---|
| `run_id` | Groups events for one authorized test. |
| `event_id` | Random identifier for record integrity and de-duplication. |
| `event_type` | Known route class, such as metadata page, image asset, or VLM callback. |
| `observed_at` | Server timestamp for ordering events. |
| `route_version` | Identifies the tested handler behavior. |
| `test_case` | Names the planned control or scenario, not a person. |

Do not persist source IP, forwarded-address headers, precise location, full
user-agent, client hints, device signatures, or a token-to-person map. These
fields are not needed to establish which in-scope test route received a
request. Configure the host and edge provider to minimize or disable their
access logs where supported; document any provider-side records the operator
cannot control.

Use one random, revocable run token per test run, not per recipient. Store
operator credentials separately from event data. Do not expose event export
through an obscured URL; require authenticated operator access.

## Test cases

| Case | Action | Expected observation |
|---|---|---|
| Metadata fetch | Approved test client requests the share page. | One `metadata_page` event if the request reaches the handler. |
| Preview image fetch | Approved preview service requests the image route. | One `image_asset` event for each request received. |
| Repeated fetch | Test harness repeats the same request. | Separate events are recorded; no assumption that they represent separate viewers. |
| Cache path | Run the same request through the approved cache configuration. | Record only requests that reach the origin; compare with the controlled client-side trace. |
| Direct open | Approved participant opens the test page. | Route event recorded; the report does not label it a human view without independent confirmation. |
| VLM image test | Send an approved test image to the in-scope model pipeline. | A `vlm_callback` event only if the pipeline makes the instrumented callback. No external destination is used. |
| Stop and expiry | Disable or expire the run, then repeat a request. | No new event is stored; the route returns a non-sensitive inactive response. |

Every case has a baseline, an expected result, and a failure condition. Local
Request/Response unit tests do not substitute for a controlled integration run
through the approved platform.

## Image-payload test boundary

The related `image_payload_injection` project supplies image-borne test
techniques. For this exercise, those assets are evaluated only inside an
isolated VLM pipeline that the operator controls. Any callback points to the
run's controlled endpoint, has a revocable test token, and carries no
participant or account identifier. The test asks whether the model pipeline
causes an in-scope request; it does not target a person's device or use a
payload to identify a chat participant.

## Security and data controls

- Validate active run tokens and route names before recording.
- Authenticate the operator console and report export.
- Apply a fixed retention deadline; default raw-event retention is 14 days,
  shortened when the engagement requires it.
- Delete raw events and revoke run tokens when the test closes or the deadline
  expires.
- Exclude event data, secrets, and run tokens from source control.
- Keep provider-level request logging within the same documented retention
  review.
- Return generic errors to unauthenticated callers; never return event data
  from a public route.
- Provide a single operator stop control and test it before launch.

## Acceptance criteria

The implementation is ready for a controlled deployment only when:

1. Automated tests verify each route, active/expired tokens, unknown routes,
   duplicate requests, and stop behavior.
2. Tests assert that application records contain no IP address, user-agent,
   precise location, client hints, or person mapping.
3. Unauthenticated users cannot query or export stored events.
4. A controlled end-to-end test produces the expected event timeline for the
   approved test cases and no event for requests outside the run scope.
5. Retention and deletion are exercised, not only documented.
6. The final report distinguishes handler observations, platform-side
   observations, interpretation, and unknowns.

## Deployment sequence

1. Approve the engagement envelope and confirm the provider-log settings.
2. Deploy the collector to an isolated test hostname with event export locked
   to the operator.
3. Run synthetic route and stop/expiry tests.
4. Conduct the approved integration cases within the test window.
5. Export the minimal timeline, compare it with the client-side test record,
   and document discrepancies.
6. Revoke the run token, delete data at closeout or the retention deadline,
   and record completion.

## Evidence statement

A recorded event supports the claim that a request reached a specific route
under the conditions observed. It does not establish the person behind the
request, that the image was displayed, or intent. Attribution requires
independent evidence collected under the engagement's approved process.

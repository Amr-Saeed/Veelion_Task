# Code Review

This review covers the current backend and frontend implementation. Findings are
grouped by area and ordered roughly by impact.

## Backend

### Bugs

- **The checked-in JSON fixtures appear to be swapped.** `tasks.json` contains
  activity-log records (`action`, `info`, and `when`), while `activity.json`
  contains task records (`title`, `completed`, and timestamps). The Tasks and
  Activity modules therefore read data with the wrong shape, and the Reports
  endpoint produces misleading counts. The fixtures should be corrected and
  validated against the expected schemas before they are used.
- **The report status calculation cannot produce a meaningful `in-progress`
  count.** `reports.service.js` counts every incomplete task as `todo` and
  hard-codes `in-progress` to zero, while the API contract requires tasks
  grouped into `todo`, `in-progress`, and `done`. The task model should have one
  explicit status representation (or a documented mapping from the existing
  model), and the summary should count each supported status from that
  representation.
- **`recentActivityCount` is the total activity length, not a recent count.**
  Old activity records are included indefinitely, so the value does not match
  the name or the expected report semantics. Define a recent window (or an
  explicit recent-record rule) and filter by a parsed activity timestamp.
- **Activity creation accepts invalid records.** `createNewActivity` writes
  missing or non-string `action` and `info` values without validation. This
  creates malformed data that the feed and reports cannot reliably consume.
  Validate the request body and return a clear `400` response before writing.
- **Task updates can persist an empty title.** The controller trims a title but
  does not reject an empty update, and validation is duplicated instead of
  using the existing `taskValidator`. The same normalized validation rules
  should be used for create and update paths.
- **Task mutations do not create activity records.** The Activity Feed is
  presented as a record of application activity, but creating, updating, and
  deleting tasks does not append corresponding events. Either record those
  events in the task service or document that the feed is independent of task
  mutations.

### Performance

- **The Activity service performs synchronous filesystem I/O inside request
  handlers.** `existsSync`, `readFileSync`, and `writeFileSync` block the
  Node.js event loop. Use the shared asynchronous JSON store for reads and
  writes.
- **The Activity service duplicates file-loading logic.** `loadDataA` and
  `loadDataB` do exactly the same work, adding maintenance cost without any
  performance benefit. Keep one shared loader.
- **Every task lookup and mutation reads and rewrites the entire JSON array.**
  This is acceptable for a small assessment fixture, but it should be isolated
  behind the store and documented as a JSON-file limitation. At minimum,
  concurrent writes need serialization or another guard to avoid lost updates.

### Security

- **Activity input is written directly to a shared JSON file.** Without schema
  validation and length limits, a client can store arbitrarily large or
  unexpected values, causing storage growth and potentially rendering
  untrusted content in the UI. Enforce field types and reasonable limits.
- **The API has no request-size limit.** `express.json()` uses its default
  limit, and the activity endpoint accepts free-form data. Set an explicit
  body limit appropriate for this application.
- **The API has no production-safe operational boundary.** There is no
  authentication, rate limiting, or restriction around mutation endpoints. If
  this service is exposed beyond localhost, anyone can alter the JSON files.
  Add the appropriate access controls and rate limiting before deployment, or
  clearly keep the service local-only.

### Maintainability

- **The existing validator is not wired into the Tasks controller.** The
  project already has `taskValidator.js`, but controllers contain a second,
  inconsistent set of rules and error messages. Use the validator as the
  single boundary for normalized task input.
- **Path resolution depends on the process working directory.** Both task and
  activity storage use `process.cwd()`, so starting the server from another
  directory can read or create files in the wrong location. Resolve data paths
  from the module/project location or centralize the configured data directory.
- **The Activity module uses unclear names and inconsistent conventions**
  (`aSvc`, `c`, `get_activity`, `loadDataA`, and `loadDataB`). Consistent,
  descriptive names make the module easier to extend and review.
- **The JSON store silently converts non-array JSON into an empty array.**
  A corrupt or incorrectly shaped file can therefore look like valid empty
  data and cause accidental overwrites. Fail explicitly with a storage/data
  error and report it through the existing error handler.

### Code quality

- **Error handling is inconsistent.** Tasks use `asyncHandler` and `HttpError`,
  while Activity uses synchronous operations and lets parse/write exceptions
  escape without the same boundary. Both modules should use the same
  controller/service/error conventions.
- **Controllers perform validation and mutate the request body.** This mixes
  transport concerns with domain normalization and makes service functions
  unsafe to call from another entry point. Pass validated, newly-created
  payloads to services instead.
- **The report service uses formatting and spacing inconsistent with the rest
  of the backend.** Standardize semicolons, quoting, object formatting, and
  trailing commas, ideally with a project formatter/linter.

## Frontend

### Bugs

- **The Activity Feed silently treats fetch failures as an empty feed.** Its
  catch handler clears all data without setting an error state, so users cannot
  distinguish “no activity” from a backend outage. Keep an explicit error and
  provide retry behavior.
- **The Activity Feed filters the same query twice.** `applyFilterA` and
  `applyFilterB` implement the same predicate, so the second pass is redundant
  and makes behavior harder to reason about. Use one memoized filter.
- **The Activity Feed maintains several derived states and an artificial
  interval.** `shownActivity`, `forcedList`, `tick`, and `everySecondTick` are
  not needed to render filtered records. The interval causes repeated renders
  and can make the UI appear to change despite unchanged data; derive visible
  records directly from source data and query.
- **The frontend has no Reports page or report API client surface.** The
  backend route exists, but users cannot navigate to or consume the required
  `/reports` view. Add a typed report response, a frontend proxy/client call,
  navigation, and loading/error/empty states.
- **The Tasks Dashboard does not show update failures next to the affected
  task.** A shared error message can be easy to miss, and the task remains
  unchanged after a failed mutation. Keep the failure visible and provide a
  retry or preserve a clear per-task status.
- **The task update route maps every backend failure to HTTP 500.** A missing
  task or validation error should preserve its meaningful status (for example
  `404` or `400`) instead of appearing as a server failure to the browser.

### Performance

- **The Activity page performs unnecessary state updates on every 1.4-second
  tick.** This causes repeated filtering, array cloning, and list renders even
  when no activity changed. Removing the interval and deriving the filtered
  list eliminates that work.
- **The dashboard and activity page use inline style objects throughout the
  render path.** This creates new objects on each render and makes consistent
  responsive styling difficult. Move shared visual rules into CSS classes and
  keep component props focused on behavior.
- **The frontend proxy and client layers duplicate error and request handling.**
  A shared typed request helper would reduce parsing work and prevent the
  routes from drifting in status/error behavior.

### Security

- **Activity values are rendered as text, but there is no explicit validation
  or length policy at the frontend boundary.** The backend must remain the
  authoritative validator, and the UI should also constrain input/display
  lengths to reduce accidental abuse and layout breakage.
- **The frontend proxy exposes backend error messages directly.** Backend
  errors can contain implementation details (especially unexpected filesystem
  errors). Return safe user-facing messages while logging diagnostic details
  server-side.

### Maintainability

- **The Activity page is a monolithic component with duplicate helper
  functions, state, and rendering logic.** Extract a typed activity hook,
  reusable status/error/empty components, and a pure filter/format helper.
- **The response shapes are only partially typed.** There is no report type,
  activity response type, or shared API result abstraction, so casts can hide
  malformed backend responses. Define the API contracts centrally and
  validate important response shapes at the boundary.
- **Navigation is duplicated and incomplete.** Each page creates its own
  “Back” link and the home page does not expose all available modules. Use a
  shared navigation component and include the Reports destination.

### Code quality

- **The generic `requestJson` error path catches the error it intentionally
  throws while parsing an error response.** This makes the control flow
  confusing and can obscure the intended fallback behavior. Parse the error
  response separately, then throw exactly one normalized error.
- **There are inconsistent naming and styling conventions.** The backend
  uses mixed naming styles, and the frontend uses inline layout styles mixed
  with CSS classes. Establish consistent component, handler, and class naming.
- **Dates are formatted without guarding invalid timestamps.** A malformed
  `when` or `updatedAt` value can render “Invalid Date”. Validate API data or
  use a safe formatter with a user-friendly fallback.

### UX issues

- **The Activity Feed has no loading indicator, error message, retry action, or
  empty-state message.** Users receive no feedback during a slow request and
  no explanation when the feed has no matching records.
- **The home page cards have no descriptive supporting content or visible
  focus treatment.** It is not obvious what each module offers, and keyboard
  users receive weak interaction feedback. Add descriptions, focus-visible
  styles, and a clear navigation structure.
- **The task list has no indication that an update is optimistic or whether it
  succeeded beyond changing the button label.** Preserve clear status feedback
  and announce important async changes accessibly.
- **The search input lacks an associated label.** A placeholder is not a
  sufficient accessible name and disappears while typing. Add a visible or
  screen-reader label.

### React best practices

- **Derived values are stored in state.** `shownActivity` and `forcedList` can
  be calculated with `useMemo` from `allActivity` and `query`; storing them
  introduces synchronization effects and stale-state risk.
- **Effects are being used to force rerenders rather than synchronize with an
  external system.** The `tick` interval and cloning effect should be removed;
  React should render from current data rather than artificial changes.
- **Async effects do not guard against unmount or stale responses.** Activity
  loading should use an abort signal or mounted-request guard so a late
  response cannot update an unmounted component.
- **The task hook stores an empty string for IDs and error messages.** Prefer
  nullable state (`string | null`) so “no error” and “an empty error” cannot be
  confused, and use a dedicated mutation state if multiple updates are
  possible.

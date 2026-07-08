# Changelog

---

## [2026-07-08] — Booking times always shown in Qatar time

### Added
- **`lib/datetime.ts`** — shared Qatar wall-clock helpers: `formatQatarDateTime` (renders backend `scheduled_at` verbatim instead of converting to the browser time zone), `qatarSlotMs` (epoch of a Qatar slot for past-slot checks), and `nextQatarDays` (day picker list anchored to Qatar's today).

### Fixed
- **Booking confirmation showed the wrong hour outside Qatar** — the backend returns `scheduled_at` as Qatar wall-clock labeled `+00:00`; the success panel (`BookingWizard`) and My Bookings (`/account`) converted it to the viewer's time zone, so an 11 AM booking displayed as 1 PM on a UTC+2 browser. Both now render Qatar wall-clock for every viewer.
- **Past-slot graying used the browser time zone** — today's slots in the booking wizard and membership redemption flow are now compared against Qatar time (`+03:00`), so slots no longer disable an offset-dependent number of hours too early or too late for viewers outside Qatar.
- **Day picker anchored to the browser's today** — the 7-day date strips in both booking flows now start from Qatar's current date, so viewers in time zones behind Qatar no longer see (and book) yesterday's Qatar date around midnight.

## [2026-07-08] — Bus-aware website slot messaging

### Added
- **Dispatch-aware slot metadata support** — customer availability slot types now accept optional `available_bus_count` and `has_recommendation` fields from the backend.

### Changed
- **Booking wizard schedule step** — after slot selection, the booking flow can show simple fleet-availability messaging such as how many buses are currently available for that time.
- **Customer dispatch messaging** — the website now communicates that final bus assignment is confirmed by the Bubble It team, without exposing bus identity or adding a customer-facing bus selection step.

### Fixed
- **No contract drift in booking submit flow** — the website still sends the same booking creation payload and only renders the new dispatch-aware feedback when the backend includes it.

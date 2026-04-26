# Tasks — Issue #308 PostHog Dashboard

- [ ] T1. Refactor `posthog-query.sh` to add a `hogql_table` helper that python-encodes SQL into the request body (avoid the `'"'"'` escaping mess).
- [ ] T2. Append 10 new subcommands using the helper, each running its canonical HogQL.
- [ ] T3. Update the help/usage block at the bottom of `posthog-query.sh` to list the 10 new commands grouped under "Traffic-growth dashboard tiles".
- [ ] T4. Write `scripts/posthog-dashboard-config.json` with the same 10 queries wrapped in `DataTableNode` insight definitions.
- [ ] T5. Write `scripts/posthog-create-dashboard.sh` that POSTs the config to PostHog and prints the dashboard URL.
- [ ] T6. Make scripts executable (`chmod +x`).
- [ ] T7. Smoke-test: run one subcommand (`channel-mix`) to confirm auth + query path works.
- [ ] T8. Run `posthog-create-dashboard.sh` to create the live dashboard. Capture the URL.
- [ ] T9. Commit, push, open PR with body referencing #308 and #283.
- [ ] T10. Squash-merge with --admin.

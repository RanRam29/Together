import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { resolveNotificationRoute } from "./resolve-push-route";

describe("resolveNotificationRoute", () => {
  it("routes match_request to request-detail with requestId", () => {
    const route = resolveNotificationRoute({
      type: "match_request",
      request_id: "req-123",
    });
    assert.equal(route?.pathname, "/(professional)/request-detail");
    assert.equal(route?.params?.requestId, "req-123");
  });

  it("routes request_interested to parent intro-detail (not professional home)", () => {
    const route = resolveNotificationRoute({
      type: "request_interested",
      request_id: "req-456",
    });
    assert.equal(route?.pathname, "/(parent)/intro-detail");
    assert.equal(route?.params?.requestId, "req-456");
  });

  it("routes request_interested without request_id to parent requests tab", () => {
    const route = resolveNotificationRoute({ type: "request_interested" });
    assert.equal(route?.pathname, "/(parent)/(tabs)/requests");
  });

  it("routes request_declined to parent requests with highlight", () => {
    const route = resolveNotificationRoute({
      type: "request_declined",
      request_id: "req-789",
    });
    assert.equal(route?.pathname, "/(parent)/(tabs)/requests");
    assert.equal(route?.params?.highlightRequestId, "req-789");
  });

  it("routes daily_log_reminder to daily-log-form with matchId", () => {
    const route = resolveNotificationRoute({
      type: "daily_log_reminder",
      match_id: "match-1",
    });
    assert.equal(route?.pathname, "/(active-match)/daily-log-form");
    assert.equal(route?.params?.matchId, "match-1");
  });

  it("routes daily_summary_ready to daily-log-detail with logId", () => {
    const route = resolveNotificationRoute({
      type: "daily_summary_ready",
      log_id: "log-1",
      match_id: "match-1",
    });
    assert.equal(route?.pathname, "/(active-match)/daily-log-detail");
    assert.equal(route?.params?.logId, "log-1");
    assert.equal(route?.params?.matchId, "match-1");
  });

  it("routes checkin to active-match with matchId", () => {
    const route = resolveNotificationRoute({
      type: "checkin",
      match_id: "match-2",
    });
    assert.equal(route?.pathname, "/(active-match)");
    assert.equal(route?.params?.matchId, "match-2");
  });

  it("returns null for unknown notification type", () => {
    assert.equal(resolveNotificationRoute({ type: "unknown_type" }), null);
  });
});

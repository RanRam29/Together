import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getNextActions,
  getPrimaryNextAction,
  getSecondaryNextActions,
  getTabBadgeCounts,
} from "./next-actions.ts";
import { resolveLandingRoute } from "./resolve-landing.ts";
import type { NextActionContext } from "./types.ts";

function baseCtx(overrides: Partial<NextActionContext> = {}): NextActionContext {
  return {
    role: "professional",
    hour: 9,
    isAfternoon: false,
    verified: true,
    hasCheckedInToday: false,
    hasCheckedOutToday: false,
    todayLogCount: 0,
    hasPublishedChild: true,
    hasPendingSentRequest: false,
    ...overrides,
  };
}

describe("getNextActions — professional", () => {
  it("prioritizes verification when unverified", () => {
    const primary = getPrimaryNextAction(baseCtx({ verified: false }));
    assert.equal(primary?.id, "pro_verify_docs");
  });

  it("shows check-in in the morning without check-in", () => {
    const primary = getPrimaryNextAction(
      baseCtx({ activeMatchId: "m1", childName: "Noa" }),
    );
    assert.equal(primary?.id, "pro_checkin");
  });

  it("shows checkout after check-in without checkout", () => {
    const primary = getPrimaryNextAction(
      baseCtx({
        activeMatchId: "m1",
        hasCheckedInToday: true,
        hasCheckedOutToday: false,
      }),
    );
    assert.equal(primary?.id, "pro_checkout");
  });

  it("shows daily log in the afternoon without logs", () => {
    const primary = getPrimaryNextAction(
      baseCtx({
        activeMatchId: "m1",
        hour: 15,
        isAfternoon: true,
        hasCheckedInToday: true,
        hasCheckedOutToday: true,
      }),
    );
    assert.equal(primary?.id, "pro_daily_log");
  });

  it("shows browse when no active match", () => {
    const primary = getPrimaryNextAction(baseCtx());
    assert.equal(primary?.id, "pro_browse");
  });
});

describe("getNextActions — parent", () => {
  const parentBase = (overrides: Partial<NextActionContext> = {}) =>
    baseCtx({ role: "parent", ...overrides });

  it("prioritizes interested request approval", () => {
    const primary = getPrimaryNextAction(
      parentBase({
        interestedRequestId: "r1",
        interestedProfessionalName: "Dana",
      }),
    );
    assert.equal(primary?.id, "parent_approve_request");
    assert.equal(primary?.href, "/(parent)/intro-detail");
    assert.equal(primary?.params?.requestId, "r1");
  });

  it("shows waiting card for pending sent request", () => {
    const primary = getPrimaryNextAction(
      parentBase({ hasPendingSentRequest: true }),
    );
    assert.equal(primary?.id, "parent_waiting_request");
  });

  it("shows no check-in alert when match active and no check-in", () => {
    const primary = getPrimaryNextAction(
      parentBase({
        activeMatchId: "m1",
        professionalName: "Dana",
      }),
    );
    assert.equal(primary?.id, "parent_no_checkin");
  });
});

describe("secondary actions and badges", () => {
  it("returns secondary actions after primary", () => {
    const secondary = getSecondaryNextActions(
      baseCtx({
        activeMatchId: "m1",
        pendingRequestId: "r1",
        childName: "Noa",
      }),
      2,
    );
    assert.equal(secondary.length, 1);
    assert.equal(secondary[0].id, "pro_checkin");
  });

  it("sets pro_today badge when check-in missing", () => {
    const badges = getTabBadgeCounts(
      baseCtx({ activeMatchId: "m1", childName: "Noa" }),
    );
    assert.equal(badges.pro_today, 1);
  });

  it("sets parent_requests badge for interested", () => {
    const badges = getTabBadgeCounts(
      baseCtx({
        role: "parent",
        interestedRequestId: "r1",
      }),
    );
    assert.equal(badges.parent_requests, 1);
  });
});

describe("resolveLandingRoute", () => {
  it("lands professional on today during morning ops", () => {
    const ctx = baseCtx({ activeMatchId: "m1", childName: "Noa" });
    const route = resolveLandingRoute(ctx, "daily_ops_morning");
    assert.equal(route, "/(professional)/today");
  });

  it("lands parent on requests when approval needed", () => {
    const ctx = baseCtx({
      role: "parent",
      interestedRequestId: "r1",
    });
    const route = resolveLandingRoute(ctx, "request_needs_approval");
    assert.equal(route, "/(parent)/(tabs)/requests");
  });

  it("returns null when no smart landing applies", () => {
    const route = resolveLandingRoute(baseCtx(), "no_active_match");
    assert.equal(route, null);
  });
});

describe("action ordering", () => {
  it("sorts actions by priority", () => {
    const actions = getNextActions(
      baseCtx({
        activeMatchId: "m1",
        pendingRequestId: "r1",
        childName: "Noa",
      }),
    );
    for (let i = 1; i < actions.length; i += 1) {
      assert.ok(actions[i].priority >= actions[i - 1].priority);
    }
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildMainBranchFromGym,
  buildUniqueBranchSlug,
  canDeleteGymBranch,
  canManageGymBranches,
  DEFAULT_BRANCH_NAME,
  DEFAULT_BRANCH_SLUG,
  inheritValue,
  inheritList,
  publicBranchDisplayName,
  buildBranchListingSlug,
  buildUniqueListingSlug,
  getGymBranchPath,
  gymLocationUpdateFromBranch,
  gymsNeedingPrimaryBranchBackfill,
  isPubliclyVisibleBranch,
  isReservedBranchSlug,
  shouldOverwriteGymLocation,
} from "./gym-branch-rules";

describe("gym branch slugs", () => {
  it("avoids reserved public path segments", () => {
    assert.equal(isReservedBranchSlug("claim"), true);
    assert.equal(isReservedBranchSlug("eme"), false);
    assert.equal(buildUniqueBranchSlug("claim", []), "claim-branch");
  });

  it("keeps slugs unique per gym", () => {
    assert.equal(buildUniqueBranchSlug("EME", ["eme"]), "eme-2");
    assert.equal(buildUniqueBranchSlug("EME", ["eme", "eme-2"]), "eme-3");
    assert.equal(buildUniqueBranchSlug("Main Branch", []), "main-branch");
    assert.equal(buildUniqueBranchSlug("", ["main"]), "main-2");
  });

  it("builds an independent listing slug from the branch address", () => {
    assert.equal(
      buildBranchListingSlug({
        name: "BodyTech Rahbar",
        area: "DHA Phase XI Rahbar",
        city: "Lahore",
      }),
      "bodytech-rahbar-dha-phase-xi-rahbar-lahore"
    );
    assert.equal(
      getGymBranchPath("bodytech-rahbar-dha-phase-xi-rahbar-lahore"),
      "/gyms/bodytech-rahbar-dha-phase-xi-rahbar-lahore/main"
    );
    assert.equal(
      buildUniqueListingSlug("lahore", ["other"]),
      "lahore-branch"
    );
  });
});

describe("primary branch and deletion rules", () => {
  it("does not allow deleting the last or primary branch", () => {
    assert.equal(canDeleteGymBranch({ isPrimary: false, totalBranchCount: 1 }).ok, false);
    assert.equal(canDeleteGymBranch({ isPrimary: true, totalBranchCount: 3 }).ok, false);
    assert.equal(canDeleteGymBranch({ isPrimary: false, totalBranchCount: 2 }).ok, true);
  });

  it("only overwrites gym location from a primary branch", () => {
    assert.equal(
      shouldOverwriteGymLocation({ branchIsPrimary: false }),
      false
    );
    assert.equal(
      shouldOverwriteGymLocation({ branchIsPrimary: false, makingPrimary: true }),
      true
    );
    assert.equal(
      shouldOverwriteGymLocation({ branchIsPrimary: true }),
      true
    );
  });
});

describe("status filtering", () => {
  it("only treats ACTIVE branches as public", () => {
    assert.equal(isPubliclyVisibleBranch("ACTIVE"), true);
    assert.equal(isPubliclyVisibleBranch("TEMPORARILY_CLOSED"), false);
    assert.equal(isPubliclyVisibleBranch("PERMANENTLY_CLOSED"), false);
  });
});

describe("authorization", () => {
  it("allows admin any gym and owners only their gym", () => {
    assert.equal(
      canManageGymBranches({ role: "admin", gymId: "g1", ownerGymId: null }),
      true
    );
    assert.equal(
      canManageGymBranches({ role: "owner", gymId: "g1", ownerGymId: "g1" }),
      true
    );
    assert.equal(
      canManageGymBranches({ role: "owner", gymId: "g1", ownerGymId: "g2" }),
      false
    );
    assert.equal(
      canManageGymBranches({ role: "owner", gymId: "g1", ownerGymId: null }),
      false
    );
  });
});

describe("idempotent backfill payload", () => {
  it("creates Main Branch / main from gym location fields", () => {
    const payload = buildMainBranchFromGym({
      address: "Plot 1",
      area: "F-7",
      city: "Islamabad",
      latitude: 33.7,
      longitude: 73.0,
      whatsappNumber: "03001234567",
      openingHours: "Daily · 6:00 AM – 11:00 PM",
      ladiesHours: null,
    });

    assert.equal(payload.name, DEFAULT_BRANCH_NAME);
    assert.equal(payload.slug, DEFAULT_BRANCH_SLUG);
    assert.equal(payload.isPrimary, true);
    assert.equal(payload.status, "ACTIVE");
    assert.equal(payload.address, "Plot 1");
    assert.equal(payload.whatsappNumber, "03001234567");
  });

  it("only backfills gyms with zero branches", () => {
    assert.deepEqual(
      gymsNeedingPrimaryBranchBackfill([
        { id: "a", branchCount: 0 },
        { id: "b", branchCount: 1 },
        { id: "c", branchCount: 0 },
      ]),
      ["a", "c"]
    );
  });

  it("does not blank gym WhatsApp when a primary branch has none", () => {
    const update = gymLocationUpdateFromBranch(
      {
        address: "A",
        area: "B",
        city: "Lahore",
        latitude: null,
        longitude: null,
        whatsappNumber: null,
        openingHours: null,
        ladiesHours: null,
      },
      "03001112233"
    );
    assert.equal(update.whatsappNumber, "03001112233");
    assert.equal(update.city, "Lahore");
  });
});

describe("branch inherit helpers", () => {
  it("uses common values when the flag is on or the branch value is empty", () => {
    assert.equal(inheritValue(true, "branch hours", "common hours"), "common hours");
    assert.equal(inheritValue(false, "", "common hours"), "common hours");
    assert.equal(inheritValue(false, "branch hours", "common hours"), "branch hours");
    assert.deepEqual(inheritList(true, ["A"], ["B", "C"]), ["B", "C"]);
    assert.deepEqual(inheritList(false, [], ["B", "C"]), ["B", "C"]);
    assert.deepEqual(inheritList(false, ["A"], ["B", "C"]), ["A"]);
  });

  it("shows the gym name for a default Main Branch", () => {
    assert.equal(publicBranchDisplayName("BodyTech", "Main Branch"), "BodyTech");
    assert.equal(publicBranchDisplayName("BodyTech", "EME"), "EME");
  });
});

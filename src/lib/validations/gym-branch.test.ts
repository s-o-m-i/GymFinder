import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { gymBranchFormSchema } from "./gym-branch";

describe("gymBranchFormSchema", () => {
  it("accepts a valid branch payload", () => {
    const parsed = gymBranchFormSchema.safeParse({
      name: "BodyTech EME",
      slug: "eme",
      address: "DHA Phase XII",
      area: "DHA Phase XII",
      city: "Lahore",
      latitude: "31.5",
      longitude: "74.3",
      phone: "03001112233",
      whatsappNumber: "03001112233",
      email: "eme@example.com",
      openingHours: "Daily · 6:00 AM – 11:00 PM",
      ladiesHours: "",
      status: "ACTIVE",
      isPrimary: false,
    });

    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.latitude, 31.5);
      assert.equal(parsed.data.email, "eme@example.com");
      assert.equal(parsed.data.ladiesHours, null);
    }
  });

  it("rejects missing name and invalid email", () => {
    const parsed = gymBranchFormSchema.safeParse({
      name: "",
      address: "A",
      area: "B",
      city: "Lahore",
      email: "not-an-email",
    });
    assert.equal(parsed.success, false);
  });
});

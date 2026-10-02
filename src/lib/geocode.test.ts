import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildGeocodeQueries } from "./geocode";
import { getDistance } from "./getDistance";

describe("geocode query fallbacks", () => {
  it("drops floor prefixes and tries area plus city", () => {
    const queries = buildGeocodeQueries({
      address: "4TH FLOOR VANGUARD ARENA GYM EMPORIUM MALL F10 MARKAZ",
      area: "F-10",
      city: "Islamabad",
    });

    assert.ok(queries.some((query) => query.includes("EMPORIUM MALL")));
    assert.ok(queries.includes("F-10, Islamabad, Pakistan"));
    assert.ok(!queries[0].toLowerCase().includes("4th floor"));
  });
});

describe("nearby distance sanity", () => {
  it("puts F-10 Markaz well under 10 km from E-11 Islamabad", () => {
    const e11 = { lat: 33.6985, lng: 72.9785 };
    const f10Markaz = { lat: 33.6958973, lng: 73.0124707 };
    const km = getDistance(e11.lat, e11.lng, f10Markaz.lat, f10Markaz.lng);

    assert.ok(km > 1 && km < 8, `expected ~3 km, got ${km}`);
  });
});

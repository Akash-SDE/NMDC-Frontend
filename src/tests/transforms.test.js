import { describe, it, expect } from "vitest";
import { formatWagonSupply, parseWagonSupply } from "../types/transforms";

describe("wagonSupply transforms", () => {
  it("formats wagon type and count", () => {
    expect(formatWagonSupply("BOXNHL", 58)).toBe("BOXNHL/58");
  });

  it("parses wagon supply string", () => {
    expect(parseWagonSupply("BOXN/45")).toEqual({
      wagonType: "BOXN",
      wagonCount: 45,
    });
  });
});

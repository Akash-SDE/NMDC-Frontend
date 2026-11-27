import { describe, expect, it } from "vitest";
import {
  assertUniqueFNoteOnRake,
  findRakeWithFNote,
} from "../features/rake/utils/fNoteRakeValidation";

const rows = [
  { rakeId: 1, rakeNumber: "RK-001", fNote: "FN-100" },
  { rakeId: 2, rakeNumber: "RK-002", fNote: "-" },
];

describe("fNoteRakeValidation", () => {
  it("finds duplicate F-Note case-insensitively", () => {
    expect(findRakeWithFNote(rows, "fn-100")?.rakeId).toBe(1);
  });

  it("ignores empty and dash F-Notes", () => {
    expect(findRakeWithFNote(rows, "")).toBeNull();
    expect(findRakeWithFNote(rows, "-")).toBeNull();
  });

  it("excludes current rake when editing", () => {
    expect(
      findRakeWithFNote(rows, "FN-100", { excludeRakeId: 1 }),
    ).toBeNull();
  });

  it("throws when duplicate on create", () => {
    expect(() => assertUniqueFNoteOnRake(rows, "FN-100")).toThrow(
      /already used/,
    );
  });

  it("allows unique F-Note", () => {
    expect(() => assertUniqueFNoteOnRake(rows, "FN-200")).not.toThrow();
  });
});
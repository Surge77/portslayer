import { describe, expect, it } from "vitest";
import { parsePortInput } from "../src/utils/port.js";

describe("parsePortInput", () => {
  it("parses valid string values", () => {
    expect(parsePortInput("3000")).toBe(3000);
  });

  it("parses valid numeric values", () => {
    expect(parsePortInput(65535)).toBe(65535);
  });

  it("throws for out of range values", () => {
    expect(() => parsePortInput(0)).toThrow();
    expect(() => parsePortInput(70000)).toThrow();
  });

  it("throws for non-numeric values", () => {
    expect(() => parsePortInput("not-a-number")).toThrow();
  });
});

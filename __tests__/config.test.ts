import { loadConfig } from "../src/config";
import * as fs from "fs";
import { jest } from "@jest/globals";

jest.mock("fs");
jest.mock("@actions/core", () => ({
  info: jest.fn(),
  warning: jest.fn(),
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe("loadConfig", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return default config when no path is given", () => {
    const config = loadConfig("");

    expect(config.categories.length).toBeGreaterThan(0);
    expect(config.uncategorizedTitle).toBe("Other Changes");
  });

  it("should load a valid config file", () => {
    const mockConfig = {
      categories: [{ title: "Custom", labels: ["custom-label"] }],
      uncategorizedTitle: "Misc",
    };

    mockFs.readFileSync.mockReturnValueOnce(
      JSON.stringify(mockConfig) as any
    );

    const config = loadConfig("some-config.json");

    expect(config.categories).toEqual(mockConfig.categories);
    expect(config.uncategorizedTitle).toBe("Misc");
  });

  it("should fall back to defaults on invalid JSON", () => {
    mockFs.readFileSync.mockReturnValueOnce("not valid json{{{" as any);

    const config = loadConfig("bad-config.json");

    expect(config.categories.length).toBeGreaterThan(0);
    expect(config.uncategorizedTitle).toBe("Other Changes");
  });
});

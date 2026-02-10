import { getInputs } from "../src/inputs";

const mockGetInput = jest.fn();

jest.mock("@actions/core", () => ({
  getInput: (...args: unknown[]) => mockGetInput(...args),
}));

describe("getInputs", () => {
  beforeEach(() => {
    mockGetInput.mockReset();
  });

  it("should parse valid inputs", () => {
    mockGetInput.mockImplementation((name: string) => {
      const map: Record<string, string> = {
        token: "ghp_test123",
        from_tag: "v1.0.0",
        to_tag: "v1.1.0",
        mode: "HYBRID",
        config_file: "",
      };
      return map[name] ?? "";
    });

    const inputs = getInputs();

    expect(inputs.token).toBe("ghp_test123");
    expect(inputs.fromTag).toBe("v1.0.0");
    expect(inputs.toTag).toBe("v1.1.0");
    expect(inputs.mode).toBe("HYBRID");
    expect(inputs.configFile).toBe("");
  });

  it("should normalize mode to uppercase", () => {
    mockGetInput.mockImplementation((name: string) => {
      const map: Record<string, string> = {
        token: "ghp_test",
        from_tag: "",
        to_tag: "",
        mode: "pr",
        config_file: "",
      };
      return map[name] ?? "";
    });

    const inputs = getInputs();
    expect(inputs.mode).toBe("PR");
  });

  it("should throw on invalid mode", () => {
    mockGetInput.mockImplementation((name: string) => {
      const map: Record<string, string> = {
        token: "ghp_test",
        from_tag: "",
        to_tag: "",
        mode: "INVALID",
        config_file: "",
      };
      return map[name] ?? "";
    });

    expect(() => getInputs()).toThrow('Invalid mode "INVALID"');
  });
});

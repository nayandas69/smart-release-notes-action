import * as core from "@actions/core";
import type { ActionInputs, Mode } from "./types";

const VALID_MODES: Mode[] = ["PR", "COMMIT", "HYBRID"];

export function getInputs(): ActionInputs {
  const token = core.getInput("token", { required: true });

  const fromTag = core.getInput("from_tag");
  const toTag = core.getInput("to_tag");

  const rawMode = core.getInput("mode").toUpperCase() as Mode;
  if (!VALID_MODES.includes(rawMode)) {
    throw new Error(
      `Invalid mode "${rawMode}". Must be one of: ${VALID_MODES.join(", ")}`
    );
  }

  const configFile = core.getInput("config_file");

  return { token, fromTag, toTag, mode: rawMode, configFile };
}

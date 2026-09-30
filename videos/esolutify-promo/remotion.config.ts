/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// yuv420p, tv range, BT.709 tags: survives Meta/Instagram transcoding without
// crushing the dark brand palette or shifting the red/gold
Config.setColorSpace("bt709");

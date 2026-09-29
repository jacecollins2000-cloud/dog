const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => value * value * (3 - 2 * value);

// The v8 edit holds the dim pre-switch frame for 18 extra frames (0.75s).
// The first practical bulb consequently appears on frame 53 at 24fps.
export const SWITCH_LIGHT = 53 / 24;

// Use decoded film time, never the stylesheet/loading clock. A cold mobile load
// must see the same black hold and dim-room reveal as a cached desktop visit.
export function arrivalLightAt(time: number) {
  const dawn = smooth(clamp((time - .5) / .65));
  const light = 1 - Math.pow(1 - clamp((time - SWITCH_LIGHT) / .22), 3);
  return { light, veil: (1 - .6 * dawn) * (1 - light) };
}

import React from "react";
import { Composition, registerRoot } from "remotion";
import { DybboDemo } from "./DybboDemo";
import { DURATION, FPS, f } from "./timeline";

const Root = () =>
  React.createElement(Composition, {
    id: "DybboDemo",
    component: DybboDemo,
    durationInFrames: f(DURATION),
    fps: FPS,
    width: 1920,
    height: 1080,
  });

registerRoot(Root);

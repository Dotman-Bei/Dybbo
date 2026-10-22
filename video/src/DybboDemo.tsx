import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { AppScene } from "./AppScene";
import { Approval, End, Logo, None, Sweep, Wall } from "./Scenes";
import { C, clamp01 } from "./theme";
import { FPS, SCENES, SFX, VO, VO_LENGTH, f } from "./timeline";

// Scenes dissolve through deep green: [scene, fade in, fade out] in seconds.
const SCENE_LIST: [keyof typeof SCENES, React.FC<{ t: number }>, number, number][] = [
  ["wall", Wall, 0.4, 0.35],
  ["approval", Approval, 0.35, 0],
  ["sweep", Sweep, 0.25, 0],
  ["none", None, 0.2, 0.35],
  ["logo", Logo, 0, 0.4],
  ["app", AppScene, 0.45, 0],
  ["end", End, 0, 1.0],
];

// Music sits under the voice: down to about -18 dB while anyone speaks, up a little in the gaps.
function musicVolume(frame: number) {
  const t = frame / FPS;
  let duck = 0;
  for (const [id, at] of VO) {
    const a = at - 0.25, b = at + VO_LENGTH[id] + 0.35;
    duck = Math.max(duck, clamp01((t - a) / 0.25) * clamp01((b - t) / 0.4));
  }
  return 0.42 - 0.28 * duck;
}

export function DybboDemo() {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{ background: C.night }}>
      {SCENE_LIST.map(([key, Scene, fin, fout]) => {
        const [a, b] = SCENES[key];
        if (t < a || t >= b) return null;
        const opacity = Math.min(fin ? clamp01((t - a) / fin) : 1, fout ? clamp01((b - t) / fout) : 1);
        return (
          <AbsoluteFill key={key} style={{ opacity }}>
            <Scene t={t} />
          </AbsoluteFill>
        );
      })}

      <Audio src={staticFile("audio/music.wav")} volume={musicVolume} />
      {VO.map(([id, at]) => (
        <Sequence key={id} from={f(at)} durationInFrames={f(VO_LENGTH[id] + 0.5)}>
          <Audio src={staticFile(`vo/${id}.wav`)} />
        </Sequence>
      ))}
      {SFX.map(([name, at, vol], i) => (
        <Sequence key={i} from={f(at)} durationInFrames={f(1.5)}>
          <Audio src={staticFile(`audio/sfx/${name}.wav`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}

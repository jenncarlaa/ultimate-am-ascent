/** Shared ornaments of the visual language. All decorative, hidden from assistive tech. */

export const Gridlines = () => (
  <div className="gridlines" aria-hidden="true">
    <i />
    <i />
    <i />
    <i />
  </div>
);

export const Numeral = ({ n }: { n: string }) => (
  <span className="numeral" data-parallax="0.16" aria-hidden="true">
    {n}
  </span>
);

/**
 * Floating low-poly shards, after the drifting crystal debris in the motion
 * reference. Each shard is two or three flat facets in the teal range, bobbing
 * on its own clock and sliding with scroll parallax.
 */
const SHARD_SETS: Record<string, [number, number, number, number][]> = {
  // [left %, top %, size px, parallax]
  a: [[6, 18, 34, 0.22], [88, 12, 22, 0.12], [72, 64, 16, 0.3], [14, 78, 12, 0.18], [52, 8, 10, 0.26]],
  b: [[92, 30, 30, 0.2], [4, 52, 18, 0.28], [60, 86, 24, 0.14], [36, 14, 12, 0.3], [80, 74, 10, 0.22]],
};
const FACETS = [
  ['M2 18L14 2L26 20Z', 'M14 2L26 20L18 30Z', 'M2 18L18 30L26 20Z'],
  ['M4 8L24 4L18 28Z', 'M4 8L18 28L2 22Z'],
  ['M14 0L28 16L12 30Z', 'M14 0L12 30L0 12Z', 'M0 12L12 30L4 26Z'],
];
export const Shards = ({ set = 'a', dark = false }: { set?: 'a' | 'b'; dark?: boolean }) => {
  const tones = dark ? ['#63B7B7', '#12959D', '#9FD8D6'] : ['#9FD8D6', '#63B7B7', '#D9EFEE'];
  return (
    <div className="shards" aria-hidden="true">
      {SHARD_SETS[set].map(([x, y, size, f], i) => (
        <span key={i} className="shard-pos" data-parallax={f} style={{ left: `${x}%`, top: `${y}%` }}>
          <svg className="shard" viewBox="0 0 30 30" width={size} height={size} style={{ animationDuration: `${7 + i * 1.7}s`, animationDelay: `${-i * 1.3}s` }}>
            {FACETS[i % 3].map((d, k) => (
              <path key={k} d={d} fill={tones[k]} fillOpacity={dark ? 0.55 - k * 0.12 : 0.85 - k * 0.15} />
            ))}
          </svg>
        </span>
      ))}
    </div>
  );
};

const TAU = Math.PI * 2;

const round = (value: number) => Math.round(value * 1000) / 1000;

export function linearWavePath(
  start: number,
  end: number,
  center: number,
  amplitude = 3,
  wavelength = 40
) {
  const angularFrequency = TAU / wavelength;
  let path = `M ${round(start)} ${round(center)}`;

  for (let x = start; x < end; x += wavelength / 2) {
    const nextX = Math.min(x + wavelength / 2, end);
    const segmentWidth = nextX - x;
    const offset = x - start;
    const nextOffset = nextX - start;
    const y = center + amplitude * Math.sin(angularFrequency * offset);
    const nextY = center + amplitude * Math.sin(angularFrequency * nextOffset);
    const slope = amplitude * angularFrequency * Math.cos(angularFrequency * offset);
    const nextSlope = amplitude * angularFrequency * Math.cos(angularFrequency * nextOffset);

    path += ` C ${round(x + segmentWidth / 3)} ${round(y + (slope * segmentWidth) / 3)} ${round(nextX - segmentWidth / 3)} ${round(nextY - (nextSlope * segmentWidth) / 3)} ${round(nextX)} ${round(nextY)}`;
  }

  return path;
}

export function circularWavePath(
  radius: number,
  amplitude = 10 / 3,
  waves = 9,
  appendWave = false
) {
  const pointsPerWave = 4;
  const pointCount = waves * pointsPerWave;
  const endIndex = pointCount + (appendWave ? pointsPerWave : 0);
  const point = (index: number) => {
    const angle = (index / pointCount) * TAU;
    const waveRadius = radius + amplitude * Math.sin(waves * angle);

    return {
      x: 50 + waveRadius * Math.cos(angle),
      y: 50 + waveRadius * Math.sin(angle),
    };
  };

  const start = point(0);
  let path = `M ${round(start.x)} ${round(start.y)}`;

  for (let index = 0; index < endIndex; index++) {
    const previous = point(index - 1);
    const current = point(index);
    const next = point(index + 1);
    const following = point(index + 2);

    path += ` C ${round(current.x + (next.x - previous.x) / 6)} ${round(current.y + (next.y - previous.y) / 6)} ${round(next.x - (following.x - current.x) / 6)} ${round(next.y - (following.y - current.y) / 6)} ${round(next.x)} ${round(next.y)}`;
  }

  return path;
}

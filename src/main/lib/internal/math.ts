export function nextPowerOf2(nr: number): number {
  if (nr < 0) {
    throw new Error("nr must be positive");
  }
  const bit = Math.ceil(Math.log2(nr));
  return 1 << (bit > 30 ? 30 : bit);
}


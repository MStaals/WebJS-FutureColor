export function getTriadicHSL(h, s, l) {
    const c1 = `hsl(${(h + 120) % 360}, ${s}%, ${l}%)`;
    const c2 = `hsl(${(h + 240) % 360}, ${s}%, ${l}%)`;
    return [c1, c2];
  }
  
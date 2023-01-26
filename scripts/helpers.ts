export const similarity = (v1, v2) => {
  let dot = 0.0;
  let norm1 = 0.0;
  let norm2 = 0.0;

  for (let x = 0; x < v1.length; x++) {
      dot += v1[x] * v2[x];
      norm1 += Math.pow(v1[x], 2);
      norm2 += Math.pow(v2[x], 2);
  }

  return dot / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

export const softmax = (logits) => {
  const maxLogit = Math.max(...logits);
  const scores = logits.map(l => Math.exp(l - maxLogit));
  const denom = scores.reduce((a, b) => a + b);
  return scores.map(s => s / denom);
}
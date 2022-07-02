export default function drawBar(per) {
    const frac = per/5;
    const bar = "█".repeat(frac) + "░".repeat(20-frac);
    return bar;
}
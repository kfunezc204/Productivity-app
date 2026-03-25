import confetti from "canvas-confetti";

export function fireConfetti(): void {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#F97316", "#FB923C", "#FDBA74", "#FED7AA", "#FFF7ED", "#FFFFFF"],
    gravity: 1.2,
    scalar: 0.9,
  });
}

import confetti from 'canvas-confetti'

const BOOKING_COLORS = ['#b8860b', '#c99a2e', '#ddb66b', '#9a6f09', '#f5edd8', '#604405']

export function fireBookingConfetti(): void {
  const end = Date.now() + 1200

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors: BOOKING_COLORS,
      disableForReducedMotion: true,
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors: BOOKING_COLORS,
      disableForReducedMotion: true,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.55 },
    colors: BOOKING_COLORS,
    disableForReducedMotion: true,
  })

  frame()
}

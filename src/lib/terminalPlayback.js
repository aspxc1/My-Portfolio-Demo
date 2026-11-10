/** First plays retain the original rhythm; completed runs get a short typed replay. */
export function getRunTiming(command, replay = false) {
  return replay
    ? { start: 20, type: Math.min(command.length * 14, 180), submit: 35 }
    : { start: 100, type: Math.min(command.length * 42, 700), submit: 120 }
}

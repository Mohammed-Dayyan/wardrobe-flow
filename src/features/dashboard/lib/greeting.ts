export function getTimeOfDayGreeting(reference: Date = new Date()): string {
  const hour = reference.getHours();

  if (hour >= 0 && hour <= 3) {
    return hour === 0 ? "Midnight check-in" : "Up late";
  }

  if (hour >= 4 && hour <= 5) {
    return "Early bird";
  }

  if (hour >= 6 && hour <= 11) {
    return "Good morning";
  }

  if (hour >= 12 && hour <= 16) {
    return "Good afternoon";
  }

  if (hour >= 17 && hour <= 20) {
    return "Good evening";
  }

  return "Good night";
}

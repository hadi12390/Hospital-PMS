export async function fetchServerDate() {
  try {
    const response = await fetch("/api/server-time/", {
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch server time");

    const data = await response.json();
    return new Date(data.server_time);
  } catch (error) {
    console.warn("Could not fetch server date, falling back to client date:", error);
    return new Date();
  }
}

export function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(isoDate) {
  if (!isoDate) return "—";

  const [year, month, day] = isoDate.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}
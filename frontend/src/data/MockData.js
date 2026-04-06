export const mockClubs = [
  {
    id: 1,
    name: "Coding Club",
    description: "Learn to build and ship software together.",
  },
  {
    id: 2,
    name: "Music Club",
    description: "Jam sessions and open mics every weekend.",
  }
];

export const mockEvents = [
  {
    id: 1,
    title: "Hackathon Night",
    date: new Date(Date.now() + 86400000 * 2).toISOString(), // Upcoming (2 days from now)
    type: "UPCOMING",
    club: "Coding Club",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 2,
    title: "Intro to React",
    date: new Date(Date.now() - 86400000 * 10).toISOString(), // Past
    type: "PAST",
    club: "Coding Club",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 3,
    title: "Algorithm Mastery",
    date: new Date(Date.now() - 86400000 * 15).toISOString(), // Past
    type: "PAST",
    club: "Coding Club",
    image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 4,
    title: "Autumn Concert",
    date: new Date(Date.now() + 86400000 * 5).toISOString(), // Upcoming
    type: "UPCOMING",
    club: "Music Club",
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 5,
    title: "Jam Session Vol. 3",
    date: new Date(Date.now() - 86400000 * 7).toISOString(), // Past
    type: "PAST",
    club: "Music Club",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 6,
    title: "Jazz Night",
    date: new Date(Date.now() - 86400000 * 20).toISOString(), // Past
    type: "PAST",
    club: "Music Club",
    image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&auto=format&fit=crop&q=60"
  }
];

export const mockNotifications = [
  { id: 1, message: "New event added by Coding Club", read: false },
  { id: 2, message: "Your attendance for Hackathon Night was marked", read: true },
  { id: 3, message: "Feedback submitted for Intro to React", read: true }
];

const randomWords = [
  "apple", "banana", "orange", "grape", "kiwi", "dog", "cat", "bird", "fish", "rabbit",
  "sun", "moon", "star", "cloud", "rain", "house", "car", "book", "pen", "chair",
  "music", "dance", "paint", "draw", "write", "happy", "smile", "laugh", "friend",
  "love", "green", "blue", "red", "yellow", "purple", "ocean", "river", "mountain",
  "forest", "desert", "pizza", "burger", "pasta", "rice", "soup", "train", "plane",
  "bus", "bike", "walk", "fire", "water", "earth", "air", "space", "play", "learn",
  "teach", "study", "explore", "flower", "tree", "grass", "leaf", "root", "light",
  "dark", "day", "night", "twilight", "road", "path", "journey", "destination",
  "adventure", "sunny", "cloudy", "windy", "rainy", "snowy", "jump", "run", "swim",
  "climb", "crawl", "sunset", "sunrise", "midnight", "noon", "afternoon", "island",
  "continent", "country", "city", "village", "summer", "autumn", "winter", "spring",
  "season", "mirror", "window", "door", "wall", "floor", "candle", "lamp", "torch",
  "flashlight", "bulb", "magic", "spell", "wizard", "witch", "wand", "computer",
  "keyboard", "mouse", "screen", "code", "friendship", "family", "love", "joy",
  "peace", "mind", "body", "soul", "spirit", "energy", "dream", "wish", "hope",
  "imagine", "create", "challenge", "adventure", "journey", "discovery", "success",
  "balance", "harmony", "zen", "meditate", "breathe", "celebrate", "party", "festive",
  "gather", "rejoice",
  // Add more words as needed
];

const storyContent = [
  "Once upon a time in a distant land, there was a brave warrior.",
  "He embarked on a journey to save his kingdom from darkness.",
  "Through forests and mountains, he fought mighty creatures.",
  "His courage and wisdom led him to victory.",
];

export const getRandomWords = (count : number) => {
  const shuffledWords = randomWords.sort(() => Math.random() - 0.5);
  return shuffledWords.slice(0, count);
};




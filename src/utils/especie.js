
const EMOJIS = { CAO: "🐕", GATO: "🐈", COELHO: "🐇", OUTRO: "🐾" };

export function emojiEspecie(especie) {
  return EMOJIS[especie] || "🐾";
}

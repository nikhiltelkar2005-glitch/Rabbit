/**
 * Anonymous Name Generator
 * Generates fun, unique names like "Curious Rabbit #4521"
 * These are shown publicly instead of real names.
 */

const adjectives = [
  'Curious', 'Silent', 'Brave', 'Clever', 'Sneaky', 'Lazy',
  'Fuzzy', 'Witty', 'Quirky', 'Sleepy', 'Grumpy', 'Jolly',
  'Tiny', 'Bold', 'Swift', 'Cosmic', 'Mystic', 'Neon',
  'Shadow', 'Ghost', 'Cyber', 'Turbo', 'Midnight', 'Golden',
];

const animals = [
  'Rabbit', 'Fox', 'Panda', 'Wolf', 'Owl', 'Tiger',
  'Penguin', 'Hedgehog', 'Raccoon', 'Lynx', 'Otter', 'Capybara',
  'Ferret', 'Marmot', 'Quokka', 'Dingo', 'Narwhal', 'Axolotl',
];

/**
 * Generate a random anonymous display name
 * @returns {string} e.g. "Curious Rabbit #4521"
 */
const generateAnonymousName = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${adj} ${animal} #${num}`;
};

module.exports = generateAnonymousName;

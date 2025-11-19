
// src/lib/pseudonymUtils.ts
// This file is now a placeholder as the data has been moved to JSON files.
// It imports the arrays from the new JSON files.
// Note: Direct import from JSON is straightforward in many environments,
// but might require specific configuration (e.g., "resolveJsonModule": true in tsconfig)
// For Firebase Functions, we will assume a simple require/import works.

import COLORS from './colors.json';
import ANIMALS from './animals.json';


const simpleHash = (str: string, max: number): number => {
  let hash = 0;
  if (!str || str.length === 0) {
    return Math.floor(Math.random() * max);
  }
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) % max;
};

export const generateAnonymousName = (userId: string | null | undefined): string => {
  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const randomNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${randomColor}${randomAnimal}${randomNumber}`;
  }

  const colorSeed = userId.substring(0, Math.min(5, userId.length)) + "c" + userId.length;
  const animalSeed = userId.substring(userId.length > 5 ? userId.length - 5 : 0) + "a" + userId.length;
  const numSeed = userId.substring(Math.floor(userId.length / 2), Math.min(userId.length, Math.floor(userId.length / 2) + 5)) + "n" + userId.length;

  const colorIndex = simpleHash(colorSeed, COLORS.length);
  const animalIndex = simpleHash(animalSeed, ANIMALS.length);
  const numericSuffix = (simpleHash(numSeed, 1000)).toString().padStart(3, '0');

  return `${COLORS[colorIndex]}${ANIMALS[animalIndex]}${numericSuffix}`;
};


export const getInitials = (name: string | undefined | null): string => {
    if (!name || typeof name !== 'string' || name.trim() === '') return '?';
    
    const nameToProcess = name.startsWith('@') ? name.substring(1) : name;

    // Regex for ColorAnimalNumber format (e.g., BlueWhale123, RedFox45)
    // Updated to expect exactly 3 digits.
    const pseudonymRegex = /^[A-Z][a-z]+([A-Z][a-zA-Z]*)[0-9]{3}$/;
    const match = nameToProcess.match(pseudonymRegex);

    if (match) {
        const firstLetter = nameToProcess.charAt(0);
        // The second capital letter of the animal part
        const animalPart = match[1];
        const secondLetter = animalPart.charAt(0);
        return (firstLetter + secondLetter).toUpperCase();
    }

    // Fallback for regular names or company names
    const words = nameToProcess.split(/\s+/).filter(Boolean);
    if (words.length === 0) return '?';
    if (words.length === 1) return words[0].substring(0, 1).toUpperCase();
    
    const firstInitial = words[0].substring(0, 1);
    const lastInitial = words[words.length - 1].substring(0, 1);
    return (firstInitial + lastInitial).toUpperCase();
};

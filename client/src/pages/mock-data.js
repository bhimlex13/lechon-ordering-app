// This is mock data. We are using direct string paths (e.g., '/images/...')
// because the images are located in the 'client/public/images/' folder.
// We do NOT use 'import' for files in the 'public' folder.

export const mockMenuItems = [
  {
    id: 'mock-1',
    name: 'Lechon Paksiw',
    description: 'Classic tangy and savory lechon stew.',
    price: 295.0,
    category: 'Main Course',
    imageUrl: '/images/lechon-paksiw.png', // Correct string path
  },
  {
    id: 'mock-2',
    name: 'Crispy Kare-Kare',
    description: 'Crispy pork with rich peanut sauce.',
    price: 345.0,
    category: 'Main Course',
    imageUrl: '/images/bulalo.png', // Make sure you add this file
  },
  {
    id: 'mock-3',
    name: 'Sinigang na Baboy',
    description: 'Tangy and savory tamarind-based pork soup.',
    price: 275.0,
    category: 'Main Course',
    imageUrl: '/images/sinigang.png', // Correct string path
  },
  {
    id: 'mock-4',
    name: 'Steamed Pampano',
    description: 'Fresh pampano fish steamed to perfection.',
    price: 565.0,
    category: 'Seafoods',
    imageUrl: '/images/lechon-paksiw.png', // Make sure you add this file
  },
  {
    id: 'mock-5',
    name: 'Shrimp Thermidor',
    description: 'Creamy and cheesy baked shrimp.',
    price: 365.0,
    category: 'Seafoods',
    imageUrl: '/images/lechon-paksiw.png', // Make sure you add this file
  },
  {
    id: 'mock-6',
    name: 'Lumpiang Shanghai',
    description: 'Crispy fried spring rolls with dipping sauce.',
    price: 290.0,
    category: 'Appetizer',
    imageUrl: '/images/lechon-paksiw.png', // Make sure you add this file
  },
];
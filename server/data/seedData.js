const lechonData = [
  {
    name: "Cochiñillo (Oven Roasted)",
    price: 10800,
    category: "Lechon",
    goodFor: "8-10 pax",
    cookedWeight: "Approx. 3-4 Kg",
    description: "Our tender, oven-roasted cochiñillo, perfectly crispy.",
    imageUrl: "/images/whole_lechon.png",
    availability: true
  },
  {
    name: "Whole Lechon (De Leche)",
    price: 12800,
    category: "Lechon",
    goodFor: "12-15 pax",
    cookedWeight: "Approx. 5-6 Kgs.",
    description: "Succulent whole lechon, tender and juicy.",
    imageUrl: "/images/whole_lechon.png",
    availability: true
  },
  {
    name: "Whole Lechon (Small)",
    price: 14800,
    category: "Lechon",
    goodFor: "20-25 pax",
    cookedWeight: "Approx. 8-11kgs",
    description: "Small-sized whole lechon, perfect for intimate gatherings.",
    imageUrl: "/images/whole_lechon.png",
    availability: true
  },
  {
    name: "Whole Lechon (Medium)",
    price: 17800,
    category: "Lechon",
    goodFor: "30-40 pax",
    cookedWeight: "Approx. 12-15 Kg",
    description: "Medium-sized whole lechon, a crowd-pleaser for any event.",
    imageUrl: "/images/whole_lechon.png",
    availability: true
  },
  {
    name: "Whole Lechon (Large)",
    price: 21800,
    category: "Lechon",
    goodFor: "40-50 pax",
    cookedWeight: "Approx. 16-20 Kg",
    description: "Large whole lechon for bigger celebrations.",
    imageUrl: "/images/whole_lechon.png",
    availability: true
  },
  {
    name: "Whole Lechon (X-Large)",
    price: 24800,
    category: "Lechon",
    goodFor: "60-70 pax",
    cookedWeight: "Approx. 21-25 Kg",
    description: "Extra-large whole lechon for grand feasts.",
    imageUrl: "/images/whole_lechon.png",
    availability: true
  },
  {
    name: "Whole Lechon (Jumbo)",
    price: 30800,
    category: "Lechon",
    goodFor: "100-120 pax",
    cookedWeight: "Approx. 26-30 kls.",
    description: "Our colossal jumbo lechon, made for the biggest parties.",
    imageUrl: "/images/whole_lechon.png",
    availability: true
  },
  {
    name: "Lechon Baka",
    price: 65800,
    category: "Lechon",
    goodFor: "150-200 pax",
    cookedWeight: "Approx. 100-120 Kg",
    description: "Whole roasted beef, a premium lechon experience.",
    imageUrl: "/images/whole_lechon.png",
    availability: true
  },
  {
    name: "Petite (Lechon Cebu)",
    price: 9800,
    category: "Lechon",
    goodFor: "8-10 pax",
    cookedWeight: "Approx. 3-4 kgs.",
    description: "Our classic Cebu-style lechon, smaller size.",
    imageUrl: "/images/whole_lechon.png",
    availability: true
  }
];

const mockMenuItems = [
  {
    name: 'Lechon Paksiw',
    description: 'Classic tangy and savory lechon stew.',
    price: 295.0,
    category: 'Main Course',
    imageUrl: '/images/lechon_paksiw.png',
  },
  {
    name: 'Crispy Kare-Kare',
    description: 'Crispy pork with rich peanut sauce.',
    price: 345.0,
    category: 'Main Course',
    imageUrl: '/images/crispy_kare_kare.png',
  },
  {
    name: 'Sinigang na Baboy',
    description: 'Tangy and savory tamarind-based pork soup.',
    price: 275.0,
    category: 'Main Course',
    imageUrl: '/images/lechon_paksiw.png',
  },
  {
    name: 'Steamed Pampano',
    description: 'Fresh pampano fish steamed to perfection.',
    price: 565.0,
    category: 'Seafoods',
    imageUrl: '/images/seafood.png',
  },
  {
    name: 'Shrimp Thermidor',
    description: 'Creamy and cheesy baked shrimp.',
    price: 365.0,
    category: 'Seafoods',
    imageUrl: '/images/seafood.png',
  },
  {
    name: 'Lumpiang Shanghai',
    description: 'Crispy fried spring rolls with dipping sauce.',
    price: 290.0,
    category: 'Appetizer',
    imageUrl: '/images/appetizer.png',
  },
];

const categoriesToSeed = [
  { name: 'Lechon' },
  { name: 'Main Course' },
  { name: 'Pork' },
  { name: 'Chicken' },
  { name: 'Beef' },
  { name: 'Seafoods' },
  { name: 'Seafood' },
  { name: 'Appetizer' },
  { name: 'Dessert' },
  { name: 'Beverage' },
  { name: 'Extras' }
];

const allMenuItems = [...mockMenuItems, ...lechonData];

module.exports = {
  lechonData,
  mockMenuItems,
  allMenuItems,
  categoriesToSeed
};

// frontend/src/data/galleryData.js

export const incisioniGallery = [
  'IncLegn_1.jpg',
  'IncLegn_2.jpg',
  'IncLegn_3.jpg',
  'IncLegn_4.jpg',
  'IncLegn_5.jpg',
  'IncLegn_6.jpg',
  'IncLegn_7.jpg',
  'IncLegn_8.jpg',
  'IncLegn_9.jpg',
  'IncLegn_10.jpg',
  'IncLegn_11.jpg',
  'IncLegn_12.jpg',
  'IncLegn_13.jpg',
  'IncLegn_14.jpg',
  'IncLegn_15.jpg',
  'IncLegn_16.jpg',
  'IncLegn_17.jpg',
  'IncLegn_18.jpg',
  'IncLegn_19.jpg',
  'IncLegn_20.jpeg',
  'IncLegn_21.jpeg',
];

export const torteGallery = [
  'Torte_2.jpg',
  'Torte_3.jpg',
  'Torte_5.jpg',
  'Torte_6.jpg',
  'Torte_7.jpg',
  'Torte_8.jpg',
  'Torte_9.jpg',
  'Torte_10.jpg',
  'Torte_11.jpg',
  'Torte_12.jpg',
  'Torte_13.jpg',
  'Torte_14.jpg',
  'Torte_15.jpeg',
  'Torte_16.jpg',
  'Torte_17.jpg',
  'Torte_18.jpg',
  'Torte_19.jpg',
  'Torte_20.jpg',
  'Torte_21.jpeg',
  'Torte_22.jpeg',
  'Torte_23.jpeg',
  'Torte_24.jpeg',
  'Torte_25.jpeg',
  'Torte_26.jpeg',
  'Torte_27.jpeg',
];

export const eventiGallery = [
  'Eventi_1.jpg',
  'Eventi_2.jpg',
  'Eventi_3.jpg',
  'Eventi_4.jpg',
  'Eventi_5.jpg',
  'Eventi_6.jpg',
  'Eventi_7.jpg',
  'Eventi_8.jpg',
  'Eventi_9.jpg',
  'Eventi_10.jpg',
  'Eventi_11.jpg',
  'Eventi_12.jpg',
  'Eventi_13.jpg',
  'Eventi_14.jpg',
  'Eventi_15.jpg',
  'Eventi_16.jpg',
  'Eventi_17.jpg',
  'Eventi_18.jpg',
  'Eventi_19.jpg',
  'Eventi_20.jpg',
  'Eventi_21.jpg',
  'Eventi_22.jpg',
  'Eventi_23.jpg',
  'Eventi_24.jpg',
  'Eventi_25.jpg',
  'Eventi_26.jpeg',
];

export const allGallery = [
  ...incisioniGallery.map(img => ({ src: img, category: 'incisioni', label: 'Incisioni su Legno' })),
  ...torteGallery.map(img => ({ src: img, category: 'torte', label: 'Torte Decorative' })),
  ...eventiGallery.map(img => ({ src: img, category: 'eventi', label: 'Allestimento Eventi' }))
];

export const getCategoryImages = (category) => {
  switch(category) {
    case 'incisioni':
      return incisioniGallery.map(img => ({ src: img, category: 'incisioni', label: 'Incisioni su Legno' }));
    case 'torte':
      return torteGallery.map(img => ({ src: img, category: 'torte', label: 'Torte Decorative' }));
    case 'eventi':
      return eventiGallery.map(img => ({ src: img, category: 'eventi', label: 'Allestimento Eventi' }));
    default:
      return allGallery;
  }
};

export const getImagePath = (category, filename) => {
  return `/gallery/${category}/${filename}`;
};
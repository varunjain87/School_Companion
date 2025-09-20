export type CurriculumNote = {
  id: string;
  subject: string;
  classLevel: number;
  chapter: string;
  concepts: string[];
  content: string;
};

export const sampleNotes: CurriculumNote[] = [
  // Class 5 Science
  {
    id: 'C5-SCI-01-01',
    subject: 'Science',
    classLevel: 5,
    chapter: 'Super Senses',
    concepts: ['sense of smell', 'sense of sight', 'sense of hearing', 'animals senses'],
    content:
      'Animals have different super senses. Ants recognize their friends by their smell. Some male insects can recognize their females from many kilometers away by their smell. Dogs have a strong sense of smell and are used by police to catch thieves. Birds have eyes on either side of their head, which allows them to see two different things at a time.',
  },
  {
    id: 'C5-SCI-02-01',
    subject: 'Science',
    classLevel: 5,
    chapter: 'A Snake Charmer’s Story',
    concepts: ['snakes', 'snake charmers', 'kalbeliyas', 'poisonous snakes'],
    content:
      'Snake charmers (Kalbeliyas) are people who catch snakes and make them dance by playing the been. They know how to remove poisonous fangs from snakes. Most snakes are not poisonous. Only four types of snakes in India are poisonous: Cobra, Common Krait, Russell’s Viper (Duboiya), and Saw-scaled Viper (Afai).',
  },
  // Class 6 Math
  {
    id: 'C6-MATH-01-01',
    subject: 'Math',
    classLevel: 6,
    chapter: 'Knowing Our Numbers',
    concepts: ['comparing numbers', 'place value', 'large numbers', 'estimation'],
    content:
      'To compare numbers, we first count the number of digits. The number with more digits is greater. If the digits are the same, we compare the leftmost digit. For example, 92 is greater than 8. 450 is greater than 352. The place value of a digit depends on its position in the number.',
  },
  {
    id: 'C6-MATH-07-01',
    subject: 'Math',
    classLevel: 6,
    chapter: 'Fractions',
    concepts: ['what is a fraction', 'fraction on number line', 'proper fractions', 'improper fractions', 'mixed fractions'],
    content: 'A fraction is a number representing part of a whole. It is written as a/b where b is not zero. A proper fraction is a fraction where the numerator is less than the denominator. An improper fraction is where the numerator is greater than or equal to the denominator. A mixed fraction is a whole number and a proper fraction combined.',
  },
  // Class 7 Science
  {
    id: 'C7-SCI-01-01',
    subject: 'Science',
    classLevel: 7,
    chapter: 'Nutrition in Plants',
    concepts: ['photosynthesis', 'autotrophs', 'heterotrophs', 'stomata'],
    content:
      'Plants prepare their own food by the process of photosynthesis. They use sunlight, water, carbon dioxide and minerals. This mode of nutrition is called autotrophic. The tiny pores on the surface of leaves through which gaseous exchange occurs are called stomata. Chlorophyll is the green pigment in leaves that helps capture sunlight.',
  },
  {
    id: 'C7-SCI-05-01',
    subject: 'Science',
    classLevel: 7,
    chapter: 'Acids, Bases and Salts',
    concepts: ['acids', 'bases', 'neutral substances', 'indicators', 'litmus paper'],
    content:
      'Acids are sour to taste. Examples: curd, lemon juice. Bases are bitter to taste and soapy to touch. Examples: baking soda, soap. Indicators are substances used to test whether a substance is acidic or basic. Litmus is a natural indicator. Acids turn blue litmus red. Bases turn red litmus blue. Neutral substances do not change the color of litmus paper.',
  },
];

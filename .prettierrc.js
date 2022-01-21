module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 120,
  tabWidth: 2,
  importOrder: [
    '^constants/(.*)$',
    '^types/(.*)$',
    '^utils/(.*)$',
    '^api/(.*)$',
    '^components/(.*)$',
    '^pages/(.*)$',
    '^store/(.*)$',
    '^[./]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

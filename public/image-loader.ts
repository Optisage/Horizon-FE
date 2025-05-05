module.exports = function ({ src, width, quality }) {
  return `${src}?w=${width}&q=${quality || 75}`;
};

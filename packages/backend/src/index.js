const app = require('./app');

const PORT = process.env.PORT || 3001;

// Start server
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});

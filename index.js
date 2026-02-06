let handlerPromise;

async function loadHandler() {
  const mod = await import('./index.mjs');
  return mod.default;
}

module.exports = async (req, res) => {
  if (!handlerPromise) {
    handlerPromise = loadHandler();
  }
  const handler = await handlerPromise;
  return handler(req, res);
};

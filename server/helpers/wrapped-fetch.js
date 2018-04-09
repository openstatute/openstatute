const fetch = require('node-fetch');

const wrappedFetch = (url, options) =>
  fetch(url, options)
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
      }

      const error = new Error(response.statusText || response.status);
      error.response = response;
      return Promise.reject(error);
    });

module.exports = wrappedFetch;

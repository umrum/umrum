/**
 * Simple wrapper over XMLHttpRequest that returns a Promise representing
 * the result of making a JSON POST request.
 *
 * @param  {String} url         the request url
 * @param  {Object} requestData the JSON data to send as the request body
 * @return {Promise}            resolves or rejects according to the response
 */
let makeRequest = function(url, method, requestData) {
  let request = new XMLHttpRequest();

  if (!request) {
    throw new Error('Could not initialize XMLHttpRequest object!');
  }

  let promise = new Promise(function(resolve, reject) {
    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        let responseObject = JSON.parse(request.responseText);

        if (request.status === 200) {
          resolve(responseObject);
        } else {
          reject(responseObject);
        }
      }
    }

    request.open(method, url);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(requestData));
  });

  return promise;
};

export let getData = function(url, requestData = {}) {
  return makeRequest(url, 'GET', requestData);
}

export let postData = function(url, requestData = {}) {
  return makeRequest(url, 'POST', requestData);
}

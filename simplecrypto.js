var SimpleCrypto = function() {
  let exports = {};
  let key = null;
  const salt = str2ab("SneezyMUD");

  // from https://dev.to/subterrane/i-learned-enough-web-crypto-to-be-dangerous-5b5j
  function ab2str(buf) {
    var decoder = new TextDecoder();
    return decoder.decode(buf);
  }

  function str2ab(str) {
    var encoder = new TextEncoder();
    return encoder.encode(str);
  }

  function serialize(ciphertext, iv) {
    return JSON.stringify({
      "ciphertext": Array.from(new Uint8Array(ciphertext)),
      "iv": Array.from(new Uint8Array(iv))
    });
  }

  // the GMCP code already parses the JSON
  function deserialize(arrayful) {
    return {
      "ciphertext": new Uint8Array(arrayful.ciphertext),
      "iv": new Uint8Array(arrayful.iv),
    };
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey
  /*
   * Get some key material to use as input to the deriveKey method.
   * The key material is a password supplied by the user.
   */
  function getKeyMaterial() {
    let password = window.prompt("Enter your password");
    let enc = new TextEncoder();
    return window.crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      {name: "PBKDF2"},
      false,
      ["deriveBits", "deriveKey"]
    );
  }

  async function prepareKey() {
    if (key === null) {
      let keyMaterial = await getKeyMaterial();
      key = await window.crypto.subtle.deriveKey(
        {
          "name": "PBKDF2",
          salt: salt,
          "iterations": 100000,
          "hash": "SHA-256"
        },
        keyMaterial,
        { "name": "AES-GCM", "length": 256},
        true,
        [ "encrypt", "decrypt" ]
      );
    }
  }

  async function _encrypt(plaintext, salt, iv) {
    await prepareKey();
    return window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      plaintext
    );
  }

  async function _decrypt(ciphertext, salt, iv) {
    await prepareKey();
    return window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      ciphertext
    );
  }

  // Assumes plaintext is text, not binary
  exports.encrypt = function(plaintext, then) {
    let iv = window.crypto.getRandomValues(new Uint8Array(12));
    _encrypt(str2ab(plaintext), salt, iv)
      .then(function(ciphertext) {
        return then(serialize(ciphertext, iv));
      })
      .catch(function(err) {
        console.error(err);
        alert(err);
      });
  };

  exports.decrypt = function(encrypted, then) {
    let deser = deserialize(encrypted);
    _decrypt(deser.ciphertext, salt, deser.iv)
      .then(function(plaintext) {
        then(ab2str(plaintext));
      })
      .catch(function(err) {
        key = null;
        console.error(err);
        alert("Failed to decrypt.\nIs your password correct?");
      });
  };

  return exports;
};

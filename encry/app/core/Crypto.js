export class Crypto {
  iv
  key
  key_encoded

  constructor() { }
  
  setIv = (iv) => { this.iv = iv }
  setKey = (key) => { this.key = key }

  getIv = () => { return this.iv }
  getKey = () => { return this.key }

  generateKeys() {
    // this.iv = window.crypto.getRandomValues(new Uint8Array(16));
    const arrayIv = [129, 221, 110, 250, 52, 44, 26, 150, 113, 167, 63, 194, 15, 22, 124, 51]
    this.iv = Uint8Array.from(arrayIv)
    console.log(this.iv)
    this.key = window.crypto.getRandomValues(new Uint8Array(32));
  }
  
  async encript(data) {
    const key_encoded = await crypto.subtle.importKey(
      "raw",
      this.key.buffer,
      "AES-CTR",
      false,
      ["encrypt", "decrypt"]
    );
    // Encrypt
    const encrypted_content = await window.crypto.subtle.encrypt(
      {
        name: "AES-CTR",
        counter: this.iv,
        length: 128,
      },
      key_encoded,
      data
    );
    // return encrypted_content
    return encrypted_content
  }

  async decript(data) {
    const key_encoded = await crypto.subtle.importKey(
      "raw",
      this.key.buffer,
      "AES-CTR",
      false,
      ["encrypt", "decrypt"]
    );
    // Decrypt
    const decrypted_content = await window.crypto.subtle.decrypt(
      {
        name: "AES-CTR",
        counter: this.iv,
        length: 128,
      },
      key_encoded,
      data
    );
    return decrypted_content
  }
}
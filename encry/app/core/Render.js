import { Crypto } from './Crypto.js'

const glob = globalThis

/**
 * Inserts as a first child of html element
 *  @param {HTMLElement} el
 *  @param {string} html
 */
const insertHTML = (el, html) => el.insertAdjacentHTML("afterbegin", html);

/**
 * Replaces children of html element
 *  @param {HTMLElement} el
 *  @param {string} html
 */
const replaceHTML = (el, html) => {
  el.replaceChildren();
  insertHTML(el, html);
};

export class Render {
  UI

  constructor() {
    this.init()
  }

  init() {
    this.UI = glob.document.getElementById('UI')
    replaceHTML(this.UI, this.htmlUI)

    const Encrypter = new Crypto()
    Encrypter.generateKeys()

    const keyInput = glob.document.querySelectorAll('input')[0];

    keyInput.value = String(Encrypter.getKey())
    keyInput.addEventListener('change', () => {
      const uint8string = keyInput.value
      const array = uint8string.split(',');
      const uint8array = Uint8Array.from(array)
      Encrypter.setKey(uint8array)
    });

    const output = glob.document.querySelector('textarea')
    output.addEventListener('change', async () => {

      // Use a regex to remove data url part
      const uint8string = String(output.value)
      const array = uint8string.split(',');

      const uint8array = Uint8Array.from(array)
      console.log(uint8array)

      const decripted = await Encrypter.decript(uint8array)
      const stringDecripted = new TextDecoder().decode(decripted);
      this.display(stringDecripted)
    }, false);


    // Get a reference to the file input
    const fileInput = glob.document.querySelectorAll('input')[1];

    fileInput.addEventListener('change', () => {

      // Get a reference to the file
      const file = fileInput.files[0];

      // Encode the file using the FileReader API
      const reader = new FileReader();
      reader.onloadend = async () => {
        // Use a regex to remove data url part
        const base64String = String(reader.result)
          .replace('data:', '')
          .replace(/^.+,/, '');

        const uint8array = new TextEncoder().encode(base64String);

        const encripted = await Encrypter.encript(uint8array)
        // const stringEncripted = new TextDecoder().decode(encripted);
        // this.display(stringEncripted)
        const encriptedArray = new Uint8Array(encripted)
        output.value = String(encriptedArray)

        const decripted = await Encrypter.decript(encripted)
        const stringDecripted = new TextDecoder().decode(decripted);
        this.display(stringDecripted)
      };
      reader.readAsDataURL(file);

    }, false);
  }

  display(data) {
    const base64img = 'data:image/png;base64,' + data
    const img = new Image();
    img.src = base64img;
    const result = glob.document.getElementById('result')
    result.replaceChildren(img);
    // result.append(img)
  }

  htmlUI = `
  <div class="two-rows">
    <label for="secret">Secret key (auto-generated by default, enter your own for array decription)</label>
    <input class="input" id="secret" type="text" />
  </div>

  <div>
    <label for="file">Source file (for encripting only)</label>
    <input class="input" id="file" type="file" />
  </div>

  <div class="two-rows">
    <label for="textarea">Encripted uint8array - works two way, displays result of file encription / enter your array for decripting, but first set proper <i>Secret key</i> above</label>
    <textarea class="input" id="textarea" rows="6"></textarea>
  </div>
  
  <div class="result" id="result"></div>`
}
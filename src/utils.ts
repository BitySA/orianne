export function uint8ArrayToHex(bytes: Uint8Array): string {
  return bytes
    .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}

export function uint8ArrayToBase64(buffer: Uint8Array): string {
  let binary = '';
  const bytes = [].slice.call(new Uint8Array(buffer));
  bytes.forEach((b) => binary += String.fromCharCode(b));
  return window.btoa(binary);
};

// copy provided text to clipboard
export async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text);
}

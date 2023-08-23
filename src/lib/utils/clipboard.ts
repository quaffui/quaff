export async function copy(text: string) {
  if (navigator.clipboard.write) {
    let blob = new Blob([text], { type: "text/plain" });
    let item = new ClipboardItem({ "text/plain": blob });
    await navigator.clipboard.write([item]);
  } else {
    await navigator.clipboard.writeText(text);
  }
}

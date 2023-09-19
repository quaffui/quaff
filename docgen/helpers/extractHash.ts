export default function extractHash(docsPropsContent: string) {
  const hashPattern = /@quaffHash ([a-f0-9]+)/;
  const match = docsPropsContent.match(hashPattern);

  return match?.[1] || null;
}

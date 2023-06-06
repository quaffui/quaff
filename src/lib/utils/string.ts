export function capitalize(str: string, eachWord: boolean = false) {
  const cap = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  if (eachWord === true) {
    return str.split(" ").map(cap).join(" ");
  } else {
    return cap(str);
  }
}

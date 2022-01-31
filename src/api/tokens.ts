export function getTokens(): Promise<any> {
  return fetch('/data/tokens.json').then((response) => response.json());
}

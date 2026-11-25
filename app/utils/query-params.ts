const SEPARATOR = '+';

export function serializeArray(array: string[]): string {
  return array.join(SEPARATOR);
}

export function deserializeArray(arrayString: string): string[] {
  return arrayString.split(SEPARATOR);
}

export function deserializeLabels(labels?: string): string[] {
  return labels ? deserializeArray(labels).filter(Boolean) : [];
}

export type QInputFillMask = boolean | string;
export type QMaskDeleteDirection = "backward" | "forward";

type MaskToken = { regex: RegExp; transform?: (value: string) => string };
type MaskPart = { char: string; token?: MaskToken };

const NAMED_MASKS: Record<string, string> = {
  date: "####/##/##",
  datetime: "####/##/## ##:##",
  time: "##:##",
  fulltime: "##:##:##",
  phone: "(###) ### - ####",
  card: "#### #### #### ####",
};

const TOKENS: Record<string, MaskToken> = {
  "#": { regex: /\d/ },
  S: { regex: /[a-zA-Z]/ },
  N: { regex: /[0-9a-zA-Z]/ },
  A: { regex: /[a-zA-Z]/, transform: (value) => value.toLocaleUpperCase() },
  a: { regex: /[a-zA-Z]/, transform: (value) => value.toLocaleLowerCase() },
  X: { regex: /[0-9a-zA-Z]/, transform: (value) => value.toLocaleUpperCase() },
  x: { regex: /[0-9a-zA-Z]/, transform: (value) => value.toLocaleLowerCase() },
};

function parseMask(mask: string): MaskPart[] {
  const normalized = NAMED_MASKS[mask] ?? mask;
  const parts: MaskPart[] = [];

  for (let index = 0; index < normalized.length; index += 1) {
    const isEscaped = normalized[index] === "\\" && index + 1 < normalized.length;

    if (isEscaped) {
      index += 1;
    }

    const char = normalized[index];
    parts.push({ char, token: isEscaped ? undefined : TOKENS[char] });
  }

  return parts;
}

function fillEnabled(fillMask: QInputFillMask | undefined) {
  return fillMask !== undefined && fillMask !== false;
}

function fillChar(fillMask: QInputFillMask | undefined) {
  return typeof fillMask === "string" && fillMask.length > 0 ? fillMask[0] : "_";
}

function applyToken(token: MaskToken, value: string) {
  return token.transform ? token.transform(value) : value;
}

function readMaskedToken(
  value: string,
  start: number,
  token: MaskToken,
  fillMask: QInputFillMask | undefined
) {
  const placeholder = fillChar(fillMask);
  const fill = fillEnabled(fillMask);

  for (let index = start; index < value.length; index += 1) {
    const char = value[index];

    if (fill && char === placeholder) {
      return { value: "", next: index + 1 };
    }

    if (token.regex.test(char)) {
      return { value: applyToken(token, char), next: index + 1 };
    }
  }

  return { value: "", next: value.length };
}

function readRawToken(raw: string, start: number, token: MaskToken) {
  for (let index = start; index < raw.length; index += 1) {
    const char = raw[index];

    if (token.regex.test(char)) {
      return { value: applyToken(token, char), next: index + 1 };
    }
  }

  return { value: "", next: raw.length };
}

function tokenPositions(maskParts: MaskPart[]) {
  const positions: number[] = [];

  for (let index = 0; index < maskParts.length; index += 1) {
    if (maskParts[index].token) {
      positions.push(index);
    }
  }

  return positions;
}

function isMaskLikeValue(value: string, maskParts: MaskPart[]) {
  for (let index = 0; index < maskParts.length; index += 1) {
    const { char, token } = maskParts[index];

    if (!token && value[index] === char) {
      return true;
    }
  }

  return false;
}

function normalizeFilledValue(
  value: string,
  maskParts: MaskPart[],
  fillMask: QInputFillMask | undefined
) {
  const placeholder = fillChar(fillMask);
  const overflow = value.slice(maskParts.length);
  let overflowIndex = 0;
  let result = "";

  for (let index = 0; index < maskParts.length; index += 1) {
    const { char: maskChar, token } = maskParts[index];
    const valueChar = value[index];

    if (!token) {
      result += maskChar;
    } else if (valueChar === placeholder) {
      const next = readRawToken(overflow, overflowIndex, token);
      overflowIndex = next.next;
      result += next.value || placeholder;
    } else if (valueChar && token.regex.test(valueChar)) {
      result += applyToken(token, valueChar);
    } else {
      const next = readRawToken(overflow, overflowIndex, token);
      overflowIndex = next.next;
      result += next.value || placeholder;
    }
  }

  return result;
}

function deleteTokenIndex(caret: number, positions: number[], direction: QMaskDeleteDirection) {
  if (direction === "backward") {
    for (let index = positions.length - 1; index >= 0; index -= 1) {
      if (positions[index] < caret) {
        return index;
      }
    }

    return -1;
  }

  for (let index = 0; index < positions.length; index += 1) {
    if (positions[index] >= caret) {
      return index;
    }
  }

  return -1;
}

export function unmaskValue(value: string, mask: string, fillMask?: QInputFillMask) {
  const maskParts = parseMask(mask);
  let result = "";
  let valueIndex = 0;

  for (const { char: maskChar, token } of maskParts) {
    if (!token) {
      valueIndex += value[valueIndex] === maskChar ? 1 : 0;
      continue;
    }

    const next = readMaskedToken(value, valueIndex, token, fillMask);
    result += next.value;
    valueIndex = next.next;
  }

  return result;
}

export function maskValue(
  value: string,
  mask: string,
  fillMask?: QInputFillMask,
  isUnmasked = false
) {
  const maskParts = parseMask(mask);

  if (isUnmasked) {
    return formatRawValue(value, maskParts, fillMask);
  }

  if (fillEnabled(fillMask) && isMaskLikeValue(value, maskParts)) {
    return normalizeFilledValue(value, maskParts, fillMask);
  }

  return formatRawValue(unmaskValue(value, mask, fillMask), maskParts, fillMask);
}

function formatRawValue(raw: string, maskParts: MaskPart[], fillMask?: QInputFillMask) {
  const fill = fillEnabled(fillMask);
  const placeholder = fillChar(fillMask);
  let result = "";
  let rawIndex = 0;
  let hasValue = false;

  for (const { char: maskChar, token } of maskParts) {
    if (!token) {
      result += fill || hasValue || rawIndex < raw.length ? maskChar : "";
      continue;
    }

    const next = readRawToken(raw, rawIndex, token);
    rawIndex = next.next;

    if (next.value) {
      result += next.value;
      hasValue = true;
    } else if (fill) {
      result += placeholder;
    } else {
      return result;
    }
  }

  return result;
}

export function maskCaretPosition(tokenCount: number, mask: string, displayLength: number) {
  const positions = tokenPositions(parseMask(mask));

  if (tokenCount <= 0) {
    return positions[0] ?? 0;
  }

  return Math.min(positions[tokenCount] ?? displayLength, displayLength);
}

export function deleteMaskedToken(
  value: string,
  mask: string,
  caret: number,
  direction: QMaskDeleteDirection,
  fillMask?: QInputFillMask
) {
  const maskParts = parseMask(mask);
  const positions = tokenPositions(maskParts);
  const tokenIndex = deleteTokenIndex(caret, positions, direction);

  if (tokenIndex < 0) {
    return null;
  }

  if (fillEnabled(fillMask)) {
    const masked = maskValue(value, mask, fillMask);
    const position = positions[tokenIndex];

    if (position === undefined || masked[position] === fillChar(fillMask)) {
      return null;
    }

    const nextMasked = `${masked.slice(0, position)}${fillChar(fillMask)}${masked.slice(
      position + 1
    )}`;

    return {
      masked: nextMasked,
      unmasked: unmaskValue(nextMasked, mask, fillMask),
      caret: position,
    };
  }

  const raw = unmaskValue(value, mask, fillMask);

  if (tokenIndex >= raw.length) {
    return null;
  }

  const unmasked = `${raw.slice(0, tokenIndex)}${raw.slice(tokenIndex + 1)}`;
  const masked = formatRawValue(unmasked, maskParts, fillMask);

  return {
    masked,
    unmasked,
    caret: maskCaretPosition(tokenIndex, mask, masked.length),
  };
}

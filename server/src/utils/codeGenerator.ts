const letters = 'abcdefghijklmnopqrstuvwxyz';
const digits = '0123456789';
const alphabet = letters + digits;

const indexToChar = new Map<number, string>(
  [...alphabet].map((char, i) => [i, char]),
);

const ALPHANUMERIC_SIZE = alphabet.length;

export const codeGenerator = () => {
  let str = '';

  for (let i = 0; i < 6; i++) {
    const char = indexToChar.get(Math.floor(Math.random() * ALPHANUMERIC_SIZE));
    str += char?.toUpperCase();
  }
  return str;
};

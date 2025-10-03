export const getFromLocalStorage = <T>(
  key: string,
  parseJson = true,
): T | null => {
  const storedLocalStorageString = localStorage.getItem(key);
  const localStorageValue = parseJson
    ? storedLocalStorageString && JSON.parse(storedLocalStorageString)
    : storedLocalStorageString;

  return localStorageValue;
};

export const setToLocalStorage = <T>(
  key: string,
  value: T,
  stringifyJson = true,
) => {
  localStorage.setItem(
    key,
    stringifyJson ? JSON.stringify(value) : (value as string),
  );
};
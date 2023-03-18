/**
 * `getStateHistory` returns the history for the provided `key`. If the `key` is not found in the localStorage an empty
 * list is returned.
 */
export const getStateHistory = (key: string): string[] => {
  try {
    const storedItems = localStorage.getItem(key);
    if (storedItems) {
      const storedItemsParsed: string[] = JSON.parse(storedItems);
      return storedItemsParsed;
    }
  } catch {}

  return [];
};

/**
 * `addStateHistoryItem` adds the provided `item` to the history for the provided `key` by calling the
 * `addStateHistoryItems` function.
 */
export const addStateHistoryItem = (key: string, item: string) => {
  addStateHistoryItems(key, [item]);
};

/**
 * `addStateHistoryItems` adds the provided `items` to the history of the provided `key`. The history is saved in the
 * localStorage of the users browser. Before the new items are added we remove all items which are empty or a duplicate
 * of another item. Then the last 10 items are saved.
 */
export const addStateHistoryItems = (key: string, items: string[]) => {
  try {
    const storedItems = localStorage.getItem(key);
    if (!storedItems) {
      localStorage.setItem(key, JSON.stringify([...new Set(items.filter((item) => item !== ''))].slice(0, 10)));
    } else {
      const storedItemsParsed: string[] = JSON.parse(storedItems);
      storedItemsParsed.unshift(...items);
      storedItemsParsed.filter((item) => item !== '');
      localStorage.setItem(key, JSON.stringify([...new Set(storedItemsParsed)].slice(0, 10)));
    }
  } catch {}
};

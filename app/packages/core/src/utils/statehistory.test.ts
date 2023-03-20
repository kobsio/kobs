import { getStateHistory, addStateHistoryItem, addStateHistoryItems } from './statehistory';

describe('statehistory', () => {
  it('should return items from history', () => {
    expect(getStateHistory('test')).toEqual([]);
    localStorage.setItem('test', JSON.stringify(['item1', 'item2']));
    expect(getStateHistory('test')).toEqual(['item1', 'item2']);
  });

  it('should save items to history', () => {
    addStateHistoryItems('test', ['item1', 'item2']);
    expect(getStateHistory('test')).toEqual(['item1', 'item2']);
  });

  it('should save last 10 items to history', () => {
    addStateHistoryItems('test', [
      'item1',
      'item2',
      'item3',
      'item4',
      'item5',
      'item6',
      'item7',
      'item8',
      'item9',
      'item10',
    ]);
    addStateHistoryItems('test', ['item11']);
    expect(getStateHistory('test')).toEqual([
      'item11',
      'item1',
      'item2',
      'item3',
      'item4',
      'item5',
      'item6',
      'item7',
      'item8',
      'item9',
    ]);
  });

  it('should save items to history which are not empty', () => {
    addStateHistoryItems('test', ['item1', '', 'item2']);
    expect(getStateHistory('test')).toEqual(['item1', 'item2']);
  });

  it('should save single item to history', () => {
    addStateHistoryItem('test', 'item1');
    expect(getStateHistory('test')).toEqual(['item1']);
  });
});

import memo from './memo';

describe('memo', () => {
  it('should memoize the async func', async () => {
    let i = 0;
    const fn = async () => {
      i += 1;
      return i;
    };

    const memoFn = memo(fn);
    expect(await memoFn()).toEqual(1);
    expect(await memoFn()).toEqual(1);
    expect(await memoFn()).toEqual(1);
    expect(i).toEqual(1);
  });
});

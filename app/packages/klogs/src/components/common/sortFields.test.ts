import compareFields from './sortFields';

describe('compareFields', () => {
  it('prefer default columns over "content_" columns', () => {
    expect(compareFields('content_attribute', 'namespace')).toBeGreaterThan(100);
  });

  it('namespace > app', () => {
    expect(compareFields('app', 'namespace')).toBeGreaterThan(100);
  });

  it('content_ > anything', () => {
    expect(compareFields('anything', 'content_something')).toBeGreaterThan(0);
  });
});

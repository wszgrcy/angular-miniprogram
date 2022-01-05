import { DeleteChange, InsertChange, ReplaceChange } from 'cyia-code-util';
import { RawUpdater } from './raw-updater';

const originContent = '123456789';
describe('raw-updater', () => {
  it('default', () => {
    const result = RawUpdater.update(originContent, []);
    expect(result).toBe(originContent);
  });
  it('insert', () => {
    const result = RawUpdater.update(originContent, [
      new InsertChange(0, '000'),
      new InsertChange(5, '000'),
      new InsertChange(8, '000'),
    ]);
    expect(result).toBe(`000123450006780009`);
  });
  it('delete', () => {
    const result = RawUpdater.update(originContent, [
      new DeleteChange(0, 1),
      new DeleteChange(5, 1),
      new DeleteChange(8, 1),
    ]);
    expect(result).toBe(`234578`);
  });
  it('replace', () => {
    const result = RawUpdater.update(originContent, [
      new ReplaceChange(0, 1, '000'),
      new ReplaceChange(5, 1, '000'),
      new ReplaceChange(8, 1, '000'),
    ]);
    expect(result).toBe(`000234500078000`);
  });
  it('混合', () => {
    const result = RawUpdater.update(originContent, [
      new InsertChange(0, '000'),
      new DeleteChange(5, 1),
      new ReplaceChange(8, 1, '000'),
    ]);
    expect(result).toBe(`0001234578000`);
  });
});

// test/methods/filtering/head.test.js
import { describe, it, expect, vi } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';

describe('DataFrame.head()', () => {
  // Sample data for testing
  const testData = [
    { id: 1, name: 'Alice', age: 25 },
    { id: 2, name: 'Bob', age: 30 },
    { id: 3, name: 'Charlie', age: 35 },
    { id: 4, name: 'David', age: 40 },
    { id: 5, name: 'Eve', age: 45 },
    { id: 6, name: 'Frank', age: 50 },
    { id: 7, name: 'Grace', age: 55 },
    { id: 8, name: 'Heidi', age: 60 },
    { id: 9, name: 'Ivan', age: 65 },
    { id: 10, name: 'Judy', age: 70 },
  ];

  it('should return the first 5 rows by default', () => {
    const df = DataFrame.create(testData);
    const result = df.head(5, { print: false });

    expect(result.rowCount).toBe(5);
    expect(result.toArray()).toEqual(testData.slice(0, 5));
  });

  it('should return the specified number of rows', () => {
    const df = DataFrame.create(testData);
    const result = df.head(3, { print: false });

    expect(result.rowCount).toBe(3);
    expect(result.toArray()).toEqual(testData.slice(0, 3));
  });

  it('should return all rows if n is greater than the number of rows', () => {
    const df = DataFrame.create(testData);
    const result = df.head(20, { print: false });

    expect(result.rowCount).toBe(10);
    expect(result.toArray()).toEqual(testData);
  });

  it('should return an empty DataFrame if the original DataFrame is empty', () => {
    const df = DataFrame.create([]);
    const result = df.head(5, { print: false });

    expect(result.rowCount).toBe(0);
    expect(result.toArray()).toEqual([]);
  });

  it('should throw an error if n is not a positive integer', () => {
    const df = DataFrame.create(testData);

    expect(() => df.head(0, { print: false })).toThrow(
      'Number of rows must be a positive number',
    );
    expect(() => df.head(-1, { print: false })).toThrow(
      'Number of rows must be a positive number',
    );
    expect(() => df.head(2.5, { print: false })).toThrow(
      'Number of rows must be an integer',
    );
  });

  it('should call print() when print option is true', () => {
    const df = DataFrame.create(testData);

    // Mock the print method
    const printSpy = vi
      .spyOn(DataFrame.prototype, 'print')
      .mockImplementation(() => df);

    // Call head with print: true
    df.head(5, { print: true });

    // Verify that print was called
    expect(printSpy).toHaveBeenCalled();

    // Restore mock
    printSpy.mockRestore();
  });

  it('should not call print() when print option is false', () => {
    const df = DataFrame.create(testData);

    // Mock the print method
    const printSpy = vi
      .spyOn(DataFrame.prototype, 'print')
      .mockImplementation(() => df);

    // Call head with print: false
    const result = df.head(5, { print: false });

    // Verify that print was not called
    expect(printSpy).not.toHaveBeenCalled();

    // Now call print on the result
    result.print();

    // Verify that print was called
    expect(printSpy).toHaveBeenCalled();

    // Restore mock
    printSpy.mockRestore();
  });

  it('should call print() by default when no options provided', () => {
    const df = DataFrame.create(testData);

    // Mock the print method
    const printSpy = vi
      .spyOn(DataFrame.prototype, 'print')
      .mockImplementation(() => df);

    // Call head without options
    df.head();

    // Verify that print was called
    expect(printSpy).toHaveBeenCalled();

    // Restore mock
    printSpy.mockRestore();
  });
});

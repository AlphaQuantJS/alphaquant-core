import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';

describe('DataFrame.mutate', () => {
  // Create a test DataFrame
  const df = DataFrame.create({
    a: [1, 2, 3],
    b: [10, 20, 30],
  });

  test('modifies an existing column', () => {
    const result = df.mutate({
      a: (row) => row.a * 2,
    });

    // Check that the result is a DataFrame instance
    expect(result).toBeInstanceOf(DataFrame);

    // In real usage, the original DataFrame should not be modified,
    // but in tests we only check the result

    // Check that the column has been modified
    expect(Array.from(result.frame.columns.a)).toEqual([2, 4, 6]);
  });

  test('modifies multiple columns simultaneously', () => {
    const result = df.mutate({
      a: (row) => row.a * 2,
      b: (row) => row.b + 5,
    });

    // Check that the columns have been modified
    expect(Array.from(result.frame.columns.a)).toEqual([2, 4, 6]);
    expect(Array.from(result.frame.columns.b)).toEqual([15, 25, 35]);
  });

  test('modifies a column based on values from other columns', () => {
    const result = df.mutate({
      a: (row) => row.a + row.b,
    });

    // Check that the column has been modified
    expect(Array.from(result.frame.columns.a)).toEqual([11, 22, 33]);
  });

  test('handles null and undefined in functions', () => {
    const result = df.mutate({
      a: (row) => (row.a > 1 ? row.a : null),
      b: (row) => (row.b > 20 ? row.b : undefined),
    });

    // Check the values of the modified columns
    // NaN is used to represent null/undefined in TypedArray
    expect(Array.from(result.frame.columns.a)).toEqual([NaN, 2, 3]);
    expect(Array.from(result.frame.columns.b)).toEqual([NaN, NaN, 30]);
  });

  test('changes the column type if necessary', () => {
    const result = df.mutate({
      a: (row) => (row.a > 2 ? 'high' : 'low'),
    });

    // Check that the column has been modified and has the correct type
    expect(result.frame.dtypes.a).toBe('str');
    expect(result.frame.columns.a).toEqual(['low', 'low', 'high']);
  });

  test('throws an error with incorrect arguments', () => {
    // Check that the method throws an error if columnDefs is not an object
    expect(() => df.mutate(null)).toThrow();
    expect(() => df.mutate('not an object')).toThrow();
    expect(() => df.mutate(123)).toThrow();

    // Check that the method throws an error if the column does not exist
    expect(() => df.mutate({ nonexistent: (row) => row.a })).toThrow();

    // Check that the method throws an error if the column definition is not a function
    expect(() => df.mutate({ a: 100 })).toThrow();
  });
});

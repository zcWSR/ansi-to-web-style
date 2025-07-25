import { jest } from '@jest/globals'
import {
  ansiToStyle,
  consoleLogAnsi,
  consoleLogAnsiParams,
  stripAnsi,
} from './index.mjs'

describe('ansiToStyle basic functionality', () => {
  it('should correctly convert basic colors', () => {
    const result = ansiToStyle('\x1b[31mRed text\x1b[0m')
    expect(result.text).toBe('%cRed text')
    expect(result.styles).toEqual(['color: #e74c3c'])
  })

  it('should correctly convert multiple colors', () => {
    const result = ansiToStyle('\x1b[31mRed\x1b[32mGreen\x1b[0m')
    expect(result.text).toBe('%cRed%cGreen')
    expect(result.styles).toEqual(['color: #e74c3c', 'color: #2ecc71'])
  })

  it('should correctly convert background color', () => {
    const result = ansiToStyle('\x1b[41mRed background\x1b[0m')
    expect(result.text).toBe('%cRed background')
    expect(result.styles).toEqual(['background-color: #e74c3c'])
  })

  it('should correctly convert formatting styles', () => {
    const result = ansiToStyle('\x1b[1mBold text\x1b[0m')
    expect(result.text).toBe('%cBold text')
    expect(result.styles).toEqual(['font-weight: bold'])
  })

  it('should correctly convert mixed styles', () => {
    const result = ansiToStyle('\x1b[1;31mBold Red\x1b[0m')
    expect(result.text).toBe('%cBold Red')
    expect(result.styles).toEqual(['color: #e74c3c; font-weight: bold'])
  })

  it('should correctly convert bright colors', () => {
    const result = ansiToStyle('\x1b[91mBright Red\x1b[0m')
    expect(result.text).toBe('%cBright Red')
    expect(result.styles).toEqual(['color: #ff6b6b'])
  })

  it('should handle complex ANSI sequences', () => {
    const complexString =
      '\x1b[31mError: \x1b[0mSomething went wrong \x1b[32m✓ Fixed!\x1b[0m'
    const result = ansiToStyle(complexString)
    expect(result.text).toBe('%cError: %cSomething went wrong %c✓ Fixed!')
    expect(result.styles).toEqual(['color: #e74c3c', '', 'color: #2ecc71'])
  })

  it('should handle strings without ANSI sequences', () => {
    const result = ansiToStyle('Plain text')
    expect(result.text).toBe('Plain text')
    expect(result.styles).toEqual([])
  })

  it('should handle empty string', () => {
    const result = ansiToStyle('')
    expect(result.text).toBe('')
    expect(result.styles).toEqual([])
  })
})

describe('stripAnsi functionality', () => {
  it('should remove all ANSI sequences', () => {
    const result = stripAnsi('\x1b[31mError:\x1b[0m Something went wrong')
    expect(result).toBe('Error: Something went wrong')
  })

  it('should remove complex ANSI sequences', () => {
    const complexString =
      '\x1b[1;31mImportant:\x1b[0m \x1b[32mThis has colors\x1b[0m'
    const result = stripAnsi(complexString)
    expect(result).toBe('Important: This has colors')
  })

  it('should handle strings without ANSI sequences', () => {
    const result = stripAnsi('Plain text')
    expect(result).toBe('Plain text')
  })

  it('should handle empty string', () => {
    const result = stripAnsi('')
    expect(result).toBe('')
  })
})

describe('consoleLogAnsiParams argument handling', () => {
  it('should handle empty arguments', () => {
    const result = consoleLogAnsiParams()
    expect(result).toEqual([])
  })

  it('should handle a single ANSI string', () => {
    const inputString = '\x1b[31mError:\x1b[0m Something went wrong'
    const result = consoleLogAnsiParams(inputString)
    expect(result[0]).toBe('%cError:%c Something went wrong')
    expect(result[1]).toBe('color: #e74c3c')
    expect(result[2]).toBe('')
  })

  it('should handle a single plain string', () => {
    const result = consoleLogAnsiParams('Plain text without ANSI')
    expect(result).toEqual(['Plain text without ANSI'])
  })

  it('should handle two ANSI strings and add space', () => {
    const result = consoleLogAnsiParams(
      '\x1b[31mError:\x1b[0m',
      '\x1b[33mWarning\x1b[0m'
    )
    expect(result[0]).toBe('%cError:%c %cWarning')
    expect(result[1]).toBe('color: #e74c3c')
    expect(result[2]).toBe('')
    expect(result[3]).toBe('color: #f39c12')
  })

  it('should handle ANSI string and plain string mixed', () => {
    const result = consoleLogAnsiParams(
      '\x1b[32mSuccess:\x1b[0m',
      'Operation completed'
    )
    // 只断言第一个参数有样式，后续参数文本和样式数组长度与 %c 数量一致即可
    expect(result[0].includes('Success:')).toBe(true)
    expect(result[0].includes('Operation completed')).toBe(true)
    expect(result[1]).toBe('color: #2ecc71')
    // 样式数组长度和 %c 数量一致
    const percentCCount = (result[0].match(/%c/g) || []).length
    expect(result.length - 1).toBe(percentCCount)
  })

  it('should handle multiple mixed arguments', () => {
    const result = consoleLogAnsiParams(
      '\x1b[31mError:\x1b[0m',
      '\x1b[33mWarning\x1b[0m',
      123,
      {foo: 'bar'}
    )
    expect(result[0].includes('Error:')).toBe(true)
    expect(result[0].includes('Warning')).toBe(true)
    // 样式数组长度和 %c 数量一致
    const percentCCount = (result[0].match(/%c/g) || []).length
    expect(result.length - 1).toBe(percentCCount + 2) // +2 for 123 and object
    expect(result).toContain(123)
    expect(result).toContainEqual({foo: 'bar'})
  })

  it('should handle only non-string arguments', () => {
    const result = consoleLogAnsiParams(123, {foo: 'bar'}, [1, 2, 3])
    expect(result).toEqual([123, {foo: 'bar'}, [1, 2, 3]])
  })

  it('should handle complex styled strings', () => {
    const result = consoleLogAnsiParams(
      '\x1b[41;37;1mCRITICAL:\x1b[0m',
      '\x1b[32mSystem\x1b[0m'
    )

    expect(result[0]).toBe('%cCRITICAL:%c %cSystem')
    const expectedStyle =
      'background-color: #e74c3c; color: #ecf0f1; font-weight: bold'
    expect(result[1]).toBe(expectedStyle)
    expect(result[2]).toBe('')
    expect(result[3]).toBe('color: #2ecc71')
  })
})

describe('consoleLogAnsiParams - should return original arguments when no ANSI style present', () => {
  it('returns original arguments for plain strings, Chrome style strings, numbers, objects, and mixed types', () => {
    const obj = { foo: 'bar' }
    const cases = [
      ['hello world'],
      ['%cHello', 'color: red;'],
      [42],
      [obj],
      ['plain', 123, obj],
      ['foo', 'bar', 'baz']
    ]
    for (const input of cases) {
      expect(consoleLogAnsiParams(...input)).toEqual(input)
    }
  })
})

describe('consoleLogAnsi output tests', () => {
  let consoleSpy

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('should call console.log with a single ANSI string', () => {
    consoleLogAnsi('\x1b[31mError:\x1b[0m Something went wrong')

    expect(consoleSpy).toHaveBeenCalledWith(
      '%cError:%c Something went wrong',
      'color: #e74c3c',
      ''
    )
  })

  it('should call console.log with multiple arguments', () => {
    consoleLogAnsi('\x1b[31mError:\x1b[0m', 'Database failed:', {
      host: 'localhost',
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      '%cError:%c Database failed:',
      'color: #e74c3c',
      '',
      {host: 'localhost'}
    )
  })

  it('should call console.log with empty arguments', () => {
    consoleLogAnsi()

    expect(consoleSpy).toHaveBeenCalledWith()
  })

  it('should call console.log with mixed arguments', () => {
    consoleLogAnsi('Hello', '\x1b[32mWorld\x1b[0m', 123, {foo: 'bar'})

    expect(consoleSpy).toHaveBeenCalledWith(
      'Hello%c %cWorld',
      '',
      'color: #2ecc71',
      123,
      {foo: 'bar'}
    )
  })
})

describe('Chrome formatting mechanism solution', () => {
  it('should correctly merge multiple ANSI strings into one formatted string', () => {
    const result = consoleLogAnsiParams(
      '\x1b[31mHello\x1b[0m',
      '\x1b[32mWorld\x1b[0m'
    )

    // Validate formatted string structure
    expect(result[0]).toBe('%cHello%c %cWorld')

    // Validate style array
    expect(result[1]).toBe('color: #e74c3c')
    expect(result[2]).toBe('')
    expect(result[3]).toBe('color: #2ecc71')
  })

  it('should add empty style for space to prevent style inheritance', () => {
    const result = consoleLogAnsiParams(
      '\x1b[31;1mError:\x1b[0m',
      '\x1b[33mWarning\x1b[0m'
    )

    // Validate styles before and after space
    expect(result[0]).toBe('%cError:%c %cWarning')
    expect(result[2]).toBe('') // Empty style for space
  })
})

describe('performance tests', () => {
  it('should complete a large number of conversions in reasonable time', () => {
    const testString =
      '\x1b[31mError:\x1b[0m \x1b[1mBold text\x1b[0m \x1b[32mSuccess\x1b[0m'
    const iterations = 1000

    const startTime = performance.now()

    for (let i = 0; i < iterations; i++) {
      ansiToStyle(testString)
    }

    const endTime = performance.now()
    const duration = endTime - startTime

    // Expect 1000 conversions to complete within 100ms
    expect(duration).toBeLessThan(100)
  })

  it('should correctly handle a large number of arguments', () => {
    const manyParams = Array.from({length: 100}, (_, i) =>
      i % 2 === 0 ? `\x1b[3${i % 8}mText${i}\x1b[0m` : `PlainText${i}`
    )

    const result = consoleLogAnsiParams(...manyParams)

    // Validate that the result is an array
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('edge cases', () => {
  it('should handle invalid ANSI sequences', () => {
    const result = ansiToStyle('\x1b[999mInvalid code\x1b[0m')
    expect(result.text).toBe('%cInvalid code')
    expect(result.styles).toEqual([''])
  })

  it('should handle incomplete ANSI sequences', () => {
    const result = ansiToStyle('\x1b[31mIncomplete')
    expect(result.text).toBe('%cIncomplete')
    expect(result.styles).toEqual(['color: #e74c3c'])
  })

  it('should handle consecutive reset codes', () => {
    const result = ansiToStyle('\x1b[31m\x1b[0m\x1b[0mText')
    expect(result.text).toBe('%cText')
    expect(result.styles).toEqual([''])
  })

  it('should handle very long strings', () => {
    const longText = 'A'.repeat(10000)
    const result = ansiToStyle(`\x1b[31m${longText}\x1b[0m`)
    expect(result.text).toBe(`%c${longText}`)
    expect(result.styles).toEqual(['color: #e74c3c'])
  })
})

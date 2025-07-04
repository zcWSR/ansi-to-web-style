# ANSI to Console Style Converter

This tool converts strings containing ANSI escape sequences into format specifiers supported by Chrome DevTools Console, especially for old browsers or environments that don't support ANSI escape sequences like [console-feed](https://github.com/samdenty/console-feed).

## 🚀 Quick Start

```typescript
import {
  ansiToConsole,
  consoleLogAnsi,
  consoleLogAnsiParams,
  stripAnsi,
} from './ansiToConsole'

// Output colored text directly in the console (supports multiple arguments)
consoleLogAnsi('\x1b[31mError: \x1b[0mSomething went wrong!')

// Use multiple arguments, just like console.log
consoleLogAnsi('\x1b[31mError:\x1b[0m', 'Database connection failed:', {
  host: 'localhost',
  port: 5432,
})

// Get formatted parameter array (for custom handling)
const params = consoleLogAnsiParams(
  '\x1b[32mSuccess!\x1b[0m',
  'Task completed in',
  1.23,
  'seconds'
)
console.log(...params)

// Or get the conversion result for custom handling
const result = ansiToConsole('\x1b[32mSuccess!\x1b[0m')
console.log(result.text, ...result.styles)
```

## 📋 API Reference

### `ansiToConsole(ansiString: string): ConsoleResult`

Converts an ANSI string to a Console style format.

**Parameters:**

- `ansiString`: String containing ANSI escape sequences

**Returns:**

```typescript
interface ConsoleResult {
  text: string // Formatted text with %c placeholders
  styles: string[] // Corresponding CSS style array
}
```

**Example:**

```typescript
const result = ansiToConsole('\x1b[31mError:\x1b[0m File not found')
console.log(result.text, ...result.styles)
// result = {text: "%cError:%c File not found", styles: ["color: #e74c3c"]}
// Output: "%cError:%c File not found", "color: #e74c3c", ""
```

### `consoleLogAnsi(...args: any[]): void`

Convenience function to output ANSI formatted text directly in the console.
Supports multiple arguments, just like `console.log`.
Automatically adds space separators between string arguments.

**Parameters:**

- `...args`: Strings containing ANSI escape sequences or any other arguments

**Example:**

```typescript
// Single ANSI string
consoleLogAnsi('\x1b[32m✓ Task completed successfully!\x1b[0m')

// Multiple arguments (spaces are added automatically)
consoleLogAnsi(
  '\x1b[31mError:\x1b[0m',
  'Connection failed to',
  'localhost:5432'
)

// Mixed argument types
consoleLogAnsi(
  '\x1b[36mUser:\x1b[0m',
  {id: 123, name: 'John'},
  '\x1b[32m[Active]\x1b[0m'
)
```

### `consoleLogAnsiParams(ansiString: string, ...params: any[]): any[]`

Convenience function to convert ANSI strings and parameters into a formatted parameter array.

**Parameters:**

- `ansiString`: String containing ANSI escape sequences
- `...params`: Parameters to format

**Returns:**

- Formatted parameter array

**Example:**

```typescript
const params = consoleLogAnsiParams(
  '\x1b[32mSuccess!\x1b[0m',
  'Task completed in',
  1.23,
  'seconds'
)
// params = ["%cSuccess!", "color: #2ecc71", "Task completed in", 1.23, "seconds"]
console.log(...params)
```

### `stripAnsi(ansiString: string): string`

Removes all ANSI escape sequences from a string and returns plain text.

**Parameters:**

- `ansiString`: String containing ANSI escape sequences

**Returns:**

- Cleaned plain text string

**Example:**

```typescript
const cleaned = stripAnsi('\x1b[31mError:\x1b[0m Something went wrong')
console.log(cleaned) // "Error: Something went wrong"
```

## 🎯 Chrome Formatting Mechanism & Solution

### Chrome Limitation

Chrome DevTools `console.log` has an important limitation: **only the first argument is parsed as a formatted string for `%c` placeholders**.

```typescript
// ❌ Incorrect usage - the second '%cWorld' will not be parsed as a formatted string
console.log('%cHello', '%cWorld', 123, {foo: 'bar'}, '', 'color: red')

// ✅ Correct usage - merge all formatted content into the first argument
console.log('%cHello%cWorld', 'color: red', 'color: green', 123, {foo: 'bar'})
```

### Our Solution

The `consoleLogAnsi` and `consoleLogAnsiParams` functions will automatically:

1. **Merge ANSI strings**: Combine all strings containing ANSI sequences into a single formatted string
2. **Add space separators**: Automatically add spaces between multiple strings, preserving the default behavior of `console.log`
3. **Style reset**: Add empty styles for spaces to prevent style inheritance
4. **Preserve argument order**: Non-string arguments retain their original position and type

### Example Comparison

```typescript
// Manual handling (tedious and error-prone)
console.log(
  '%cError:%c %cWarning',
  'color: red; font-weight: bold',
  '',
  'color: yellow',
  123,
  {foo: 'bar'}
)

// Using our function (simple and intuitive)
consoleLogAnsi('\x1b[31;1mError:\x1b[0m', '\x1b[33mWarning\x1b[0m', 123, {
  foo: 'bar',
})
```

Both produce the same effect, but the latter is easier to use and maintain.

## 🎨 Supported ANSI Codes

### Color Codes

#### Foreground (Text Color)

- `\x1b[30m` - Black
- `\x1b[31m` - Red
- `\x1b[32m` - Green
- `\x1b[33m` - Yellow
- `\x1b[34m` - Blue
- `\x1b[35m` - Magenta
- `\x1b[36m` - Cyan
- `\x1b[37m` - White

#### Bright Foreground

- `\x1b[90m` - Bright Black (Gray)
- `\x1b[91m` - Bright Red
- `\x1b[92m` - Bright Green
- `\x1b[93m` - Bright Yellow
- `\x1b[94m` - Bright Blue
- `\x1b[95m` - Bright Magenta
- `\x1b[96m` - Bright Cyan
- `\x1b[97m` - Bright White

#### Background

- `\x1b[40m` - Black background
- `\x1b[41m` - Red background
- `\x1b[42m` - Green background
- `\x1b[43m` - Yellow background
- `\x1b[44m` - Blue background
- `\x1b[45m` - Magenta background
- `\x1b[46m` - Cyan background
- `\x1b[47m` - White background

#### Bright Background

- `\x1b[100m` - Bright Black background
- `\x1b[101m` - Bright Red background
- `\x1b[102m` - Bright Green background
- `\x1b[103m` - Bright Yellow background
- `\x1b[104m` - Bright Blue background
- `\x1b[105m` - Bright Magenta background
- `\x1b[106m` - Bright Cyan background
- `\x1b[107m` - Bright White background

### Format Codes

- `\x1b[1m` - Bold
- `\x1b[2m` - Dim
- `\x1b[3m` - Italic
- `\x1b[4m` - Underline
- `\x1b[7m` - Inverse
- `\x1b[9m` - Strikethrough

### Reset Codes

- `\x1b[0m` - Reset all styles
- `\x1b[22m` - Reset bold/dim
- `\x1b[23m` - Reset italic
- `\x1b[24m` - Reset underline
- `\x1b[27m` - Reset inverse
- `\x1b[29m` - Reset strikethrough
- `\x1b[39m` - Reset foreground color
- `\x1b[49m` - Reset background color

## Example

Let console-feed support ANSI escape sequences

```jsx
import React from 'react'
import {Hook, Console, Decode} from 'console-feed'
import {consoleLogAnsiParams} from 'ansi-to-web-style'

class App extends React.Component {
  state = {
    logs: [],
  }

  componentDidMount() {
    Hook(window.console, log => {
      const decodedLog = Decode(log)
      // @ts-ignore
      decodedLog.data = consoleLogAnsiParams(...log.data)
      // @ts-ignore
      this.setState(({logs}) => ({logs: [...logs, decodedLog]}))
    })

    console.log(`Hello world!`)
  }

  render() {
    return (
      <div style={{backgroundColor: '#242424'}}>
        <Console logs={this.state.logs} variant="dark" />
      </div>
    )
  }
}
```

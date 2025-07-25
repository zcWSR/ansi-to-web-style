// ANSI color code mapping to CSS colors
const ANSI_COLORS = {
  // Foreground colors
  30: '#000000', // Black
  31: '#e74c3c', // Red
  32: '#2ecc71', // Green
  33: '#f39c12', // Yellow
  34: '#3498db', // Blue
  35: '#9b59b6', // Magenta
  36: '#1abc9c', // Cyan
  37: '#ecf0f1', // White

  // Bright foreground colors
  90: '#7f8c8d', // Bright Black (Gray)
  91: '#ff6b6b', // Bright Red
  92: '#4ecdc4', // Bright Green
  93: '#ffe66d', // Bright Yellow
  94: '#74b9ff', // Bright Blue
  95: '#a29bfe', // Bright Magenta
  96: '#6c5ce7', // Bright Cyan
  97: '#ffffff', // Bright White

  // Background colors
  40: '#000000', // Black background
  41: '#e74c3c', // Red background
  42: '#2ecc71', // Green background
  43: '#f39c12', // Yellow background
  44: '#3498db', // Blue background
  45: '#9b59b6', // Magenta background
  46: '#1abc9c', // Cyan background
  47: '#ecf0f1', // White background

  // Bright background colors
  100: '#7f8c8d', // Bright Black background
  101: '#ff6b6b', // Bright Red background
  102: '#4ecdc4', // Bright Green background
  103: '#ffe66d', // Bright Yellow background
  104: '#74b9ff', // Bright Blue background
  105: '#a29bfe', // Bright Magenta background
  106: '#6c5ce7', // Bright Cyan background
  107: '#ffffff', // Bright White background
}

// ANSI format codes
// const ANSI_FORMATS = {
//   1: 'font-weight: bold',
//   2: 'opacity: 0.5',
//   3: 'font-style: italic',
//   4: 'text-decoration: underline',
//   7: 'color: #000; background-color: #fff', // Inverse
//   9: 'text-decoration: line-through',
// } as const

// Build CSS style string
const buildCssStyle = style => {
  const styles = []

  if (style.backgroundColor)
    styles.push(`background-color: ${style.backgroundColor}`)
  if (style.color) styles.push(`color: ${style.color}`)
  if (style.fontWeight) styles.push(`font-weight: ${style.fontWeight}`)
  if (style.fontStyle) styles.push(`font-style: ${style.fontStyle}`)
  if (style.textDecoration)
    styles.push(`text-decoration: ${style.textDecoration}`)
  if (style.opacity) styles.push(`opacity: ${style.opacity}`)

  return styles.join('; ')
}

/**
 * Convert ANSI escape sequences to Chrome console.log supported style format
 * @param ansiString String containing ANSI escape sequences
 * @returns Object containing formatted text and style array
 */
export function ansiToStyle(ansiString) {
  // ANSI escape sequence regex
  // eslint-disable-next-line no-control-regex
  const ansiRegex = /\u001b\[([0-9;]*)m/g

  // Check if contains ANSI sequence
  if (!ansiRegex.test(ansiString)) {
    return {
      text: ansiString,
      styles: [],
    }
  }

  // Reset regex index
  ansiRegex.lastIndex = 0

  const segments = []
  let currentStyle = {}
  let lastIndex = 0
  let match

  // Parse ANSI codes and update style state
  const parseAnsiCodes = codes => {
    const newStyle = {...currentStyle}

    if (!codes) {
      // Reset all styles
      return {}
    }

    const codeArray = codes.split(';').map(code => parseInt(code, 10))

    for (const code of codeArray) {
      if (code === 0) {
        // Reset all styles
        return {}
      } else if (code >= 30 && code <= 37) {
        // Foreground color
        newStyle.color = ANSI_COLORS[code]
      } else if (code >= 90 && code <= 97) {
        // Bright foreground color
        newStyle.color = ANSI_COLORS[code]
      } else if (code >= 40 && code <= 47) {
        // Background color
        newStyle.backgroundColor = ANSI_COLORS[code]
      } else if (code >= 100 && code <= 107) {
        // Bright background color
        newStyle.backgroundColor = ANSI_COLORS[code]
      } else if (code === 1) {
        // Bold
        newStyle.fontWeight = 'bold'
      } else if (code === 2) {
        // Dim
        newStyle.opacity = '0.5'
      } else if (code === 3) {
        // Italic
        newStyle.fontStyle = 'italic'
      } else if (code === 4) {
        // Underline
        newStyle.textDecoration = 'underline'
      } else if (code === 7) {
        // Inverse
        newStyle.color = '#000'
        newStyle.backgroundColor = '#fff'
      } else if (code === 9) {
        // Strikethrough
        newStyle.textDecoration = 'line-through'
      } else if (code === 22) {
        // Reset bold/dim
        delete newStyle.fontWeight
        delete newStyle.opacity
      } else if (code === 23) {
        // Reset italic
        delete newStyle.fontStyle
      } else if (code === 24) {
        // Reset underline
        delete newStyle.textDecoration
      } else if (code === 27) {
        // Reset inverse
        delete newStyle.color
        delete newStyle.backgroundColor
      } else if (code === 29) {
        // Reset strikethrough
        delete newStyle.textDecoration
      } else if (code === 39) {
        // Reset foreground color
        delete newStyle.color
      } else if (code === 49) {
        // Reset background color
        delete newStyle.backgroundColor
      }
    }

    return newStyle
  }

  // Process each ANSI escape sequence in the string
  while ((match = ansiRegex.exec(ansiString)) !== null) {
    // Add text before the escape sequence
    if (match.index > lastIndex) {
      const text = ansiString.slice(lastIndex, match.index)
      if (text) {
        segments.push({
          text,
          style: buildCssStyle(currentStyle),
        })
      }
    }

    // Update current style
    currentStyle = parseAnsiCodes(match[1])
    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < ansiString.length) {
    const text = ansiString.slice(lastIndex)
    if (text) {
      segments.push({
        text,
        style: buildCssStyle(currentStyle),
      })
    }
  }

  // Build final text and style array
  let finalText = ''
  const styles = []

  for (const segment of segments) {
    finalText += `%c${segment.text}`
    styles.push(segment.style)
  }

  return {
    text: finalText,
    styles,
  }
}

/**
 * Convenience function: returns the parameter array required by console.log
 * Supports multiple arguments, but must follow Chrome formatting rules
 * @param {...any} args Strings containing ANSI escape sequences or any other arguments
 * @returns {Array} console.log parameter array
 */
export function consoleLogAnsiParams(...args) {
  if (args.length === 0) {
    return []
  }

  // If only one argument and it's a string, check for ANSI sequence
  if (args.length === 1 && typeof args[0] === 'string') {
    const result = ansiToStyle(args[0])
    // If no style (i.e., no ANSI sequence), return the original string
    if (result.styles.length === 0) {
      return [args[0]]
    }
    return [result.text, ...result.styles]
  }

  // Multiple arguments:
  // Separate string and non-string arguments
  const stringArgs = []
  const nonStringArgs = []

  for (const arg of args) {
    if (typeof arg === 'string') {
      stringArgs.push(arg)
    } else {
      nonStringArgs.push(arg)
    }
  }

  // If no string arguments, return the original arguments
  if (stringArgs.length === 0) {
    return args
  }

  let combinedFormatText = ''
  const allStyles = []
  let hasAnsiContent = false

  for (let i = 0; i < stringArgs.length; i++) {
    if (i > 0) {
      // Add %c and space between arguments to prevent style inheritance
      combinedFormatText += '%c '
      allStyles.push('')
    }
    const result = ansiToStyle(stringArgs[i])
    combinedFormatText += result.text
    if (result.styles.length > 0) {
      allStyles.push(...result.styles)
      hasAnsiContent = true
    }
  }

  if (hasAnsiContent) {
    return [combinedFormatText, ...allStyles, ...nonStringArgs]
  } else {
    // If no style content, return the original arguments
    return args
  }
}

/**
 * Convenience function: directly output ANSI formatted text in console
 * Supports multiple arguments, just like console.log
 * Automatically adds space separators between multiple string arguments
 * @param {...any} args Strings containing ANSI escape sequences or any other arguments
 */
export function consoleLogAnsi(...args) {
  // eslint-disable-next-line no-console
  console.log(...consoleLogAnsiParams(...args))
}

/**
 * Remove all ANSI escape sequences from a string
 * @param ansiString String containing ANSI escape sequences
 * @returns Cleaned plain text
 */
export function stripAnsi(ansiString) {
  // eslint-disable-next-line no-control-regex
  return ansiString.replace(/\u001b\[[0-9;]*m/g, '')
}

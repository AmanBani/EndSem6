export class RubyInterpreter {
  static async execute(code: string): Promise<{ output: string; error?: string; executionTime: number }> {
    const startTime = performance.now()
    let output = ""
    let error = ""

    try {
      // Simple Ruby interpreter simulation
      const lines = code.split("\n")
      const variables: { [key: string]: any } = {}
      const classes: { [key: string]: any } = {}
      let inClass = false
      let currentClass = ""

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        if (!line || line.startsWith("#")) {
          continue
        }

        // Handle class definitions
        if (line.startsWith("class ")) {
          const classMatch = line.match(/class\s+(\w+)/)
          if (classMatch) {
            currentClass = classMatch[1]
            classes[currentClass] = { methods: {}, properties: {} }
            inClass = true
          }
          continue
        }

        if (line === "end" && inClass) {
          inClass = false
          currentClass = ""
          continue
        }

        if (!inClass) {
          // Handle puts statements
          if (line.includes("puts ")) {
            const putsMatch = line.match(/puts\s+(.+)/)
            if (putsMatch) {
              let content = putsMatch[1]

              // Handle string interpolation
              if (content.startsWith('"') && content.endsWith('"')) {
                content = content.substring(1, content.length - 1)
                content = content.replace(/#{([^}]+)}/g, (match, expr) => {
                  return this.evaluateExpression(expr, variables)
                })
              } else if (content.startsWith("'") && content.endsWith("'")) {
                content = content.substring(1, content.length - 1)
              } else {
                content = this.evaluateExpression(content, variables)
              }

              content = content.replace(/\\n/g, "\n")
              output += content + "\n"
            }
          }

          // Handle print statements
          else if (line.includes("print ")) {
            const printMatch = line.match(/print\s+(.+)/)
            if (printMatch) {
              let content = printMatch[1]

              if (content.startsWith('"') && content.endsWith('"')) {
                content = content.substring(1, content.length - 1)
                content = content.replace(/#{([^}]+)}/g, (match, expr) => {
                  return this.evaluateExpression(expr, variables)
                })
              } else if (content.startsWith("'") && content.endsWith("'")) {
                content = content.substring(1, content.length - 1)
              } else {
                content = this.evaluateExpression(content, variables)
              }

              output += content
            }
          }

          // Handle variable assignments
          else if (line.includes("=") && !line.includes("==")) {
            const varMatch = line.match(/(\w+)\s*=\s*(.+)/)
            if (varMatch) {
              const varName = varMatch[1]
              const value = varMatch[2]

              if (value.startsWith("[") && value.endsWith("]")) {
                // Array
                const arrayContent = value.substring(1, value.length - 1)
                const items = arrayContent.split(",").map((item) => this.parseValue(item.trim()))
                variables[varName] = items
              } else if (value.startsWith("{") && value.endsWith("}")) {
                // Hash
                const hashContent = value.substring(1, value.length - 1)
                const pairs = hashContent.split(",")
                const hash: { [key: string]: any } = {}

                for (const pair of pairs) {
                  const [key, val] = pair.split("=>").map((s) => s.trim())
                  const keyStr = key.replace(/['"]/g, "")
                  hash[keyStr] = this.parseValue(val)
                }

                variables[varName] = hash
              } else if (value.includes("..")) {
                // Range
                const rangeMatch = value.match(/$$(\d+)\.\.(\d+)$$/)
                if (rangeMatch) {
                  const start = Number.parseInt(rangeMatch[1])
                  const end = Number.parseInt(rangeMatch[2])
                  variables[varName] = Array.from({ length: end - start + 1 }, (_, i) => start + i)
                }
              } else if (value.includes(".new(")) {
                // Object instantiation
                const newMatch = value.match(/(\w+)\.new$$([^)]*)$$/)
                if (newMatch) {
                  const className = newMatch[1]
                  const args = newMatch[2] ? this.parseArguments(newMatch[2]) : []
                  variables[varName] = { _class: className, _args: args }
                }
              } else {
                variables[varName] = this.parseValue(value)
              }
            }
          }

          // Handle each loops
          else if (line.includes(".each")) {
            const eachMatch = line.match(/(\w+)\.each\s+do\s*\|(\w+)\|/) || line.match(/(\w+)\.each\s*\{\s*\|(\w+)\|/)
            if (eachMatch) {
              const arrayVar = eachMatch[1]
              const iterVar = eachMatch[2]
              const array = variables[arrayVar]

              // Find loop body
              const loopBody: string[] = []
              const isBlock = line.includes("{")
              i++

              if (isBlock) {
                // Single line block
                const blockContent = line.split("{")[1].split("}")[0]
                loopBody.push(blockContent.trim())
              } else {
                // Multi-line do..end block
                while (i < lines.length && !lines[i].trim().startsWith("end")) {
                  const bodyLine = lines[i].trim()
                  if (bodyLine) {
                    loopBody.push(bodyLine)
                  }
                  i++
                }
              }

              // Execute loop
              if (Array.isArray(array)) {
                for (const item of array) {
                  variables[iterVar] = item
                  for (const bodyLine of loopBody) {
                    if (bodyLine.includes("puts ")) {
                      const putsMatch = bodyLine.match(/puts\s+(.+)/)
                      if (putsMatch) {
                        let content = putsMatch[1]

                        if (content.startsWith('"') && content.endsWith('"')) {
                          content = content.substring(1, content.length - 1)
                          content = content.replace(/#{([^}]+)}/g, (match, expr) => {
                            return this.evaluateExpression(expr, variables)
                          })
                        } else if (content.startsWith("'") && content.endsWith("'")) {
                          content = content.substring(1, content.length - 1)
                        } else {
                          content = this.evaluateExpression(content, variables)
                        }

                        output += content + "\n"
                      }
                    }
                  }
                }
              }
            }
          }

          // Handle times loops
          else if (line.includes(".times")) {
            const timesMatch =
              line.match(/(\d+)\.times\s+do\s*\|(\w+)\|/) || line.match(/(\d+)\.times\s*\{\s*\|(\w+)\|/)
            if (timesMatch) {
              const count = Number.parseInt(timesMatch[1])
              const iterVar = timesMatch[2]

              // Find loop body
              const loopBody: string[] = []
              const isBlock = line.includes("{")
              i++

              if (isBlock) {
                // Single line block
                const blockContent = line.split("{")[1].split("}")[0]
                loopBody.push(blockContent.trim())
              } else {
                // Multi-line do..end block
                while (i < lines.length && !lines[i].trim().startsWith("end")) {
                  const bodyLine = lines[i].trim()
                  if (bodyLine) {
                    loopBody.push(bodyLine)
                  }
                  i++
                }
              }

              // Execute loop
              for (let j = 0; j < count; j++) {
                variables[iterVar] = j
                for (const bodyLine of loopBody) {
                  if (bodyLine.includes("puts ")) {
                    const putsMatch = bodyLine.match(/puts\s+(.+)/)
                    if (putsMatch) {
                      let content = putsMatch[1]

                      if (content.startsWith('"') && content.endsWith('"')) {
                        content = content.substring(1, content.length - 1)
                        content = content.replace(/#{([^}]+)}/g, (match, expr) => {
                          return this.evaluateExpression(expr, variables)
                        })
                      } else if (content.startsWith("'") && content.endsWith("'")) {
                        content = content.substring(1, content.length - 1)
                      } else {
                        content = this.evaluateExpression(content, variables)
                      }

                      output += content + "\n"
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      error = e instanceof Error ? e.message : "Unknown error"
    }

    const endTime = performance.now()
    return {
      output: output || "Program executed successfully",
      error: error || undefined,
      executionTime: endTime - startTime,
    }
  }

  private static parseValue(value: string): any {
    value = value.trim()

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      return value.substring(1, value.length - 1)
    }

    if (/^\d+$/.test(value)) {
      return Number.parseInt(value)
    }

    if (/^\d+\.\d+$/.test(value)) {
      return Number.parseFloat(value)
    }

    if (value === "true") return true
    if (value === "false") return false

    return value
  }

  private static parseArguments(argsStr: string): string[] {
    const args: string[] = []
    let current = ""
    let inString = false
    let stringChar = ""
    let parenCount = 0

    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i]

      if ((char === '"' || char === "'") && argsStr[i - 1] !== "\\") {
        if (!inString) {
          inString = true
          stringChar = char
        } else if (char === stringChar) {
          inString = false
          stringChar = ""
        }
      }

      if (!inString) {
        if (char === "(") parenCount++
        if (char === ")") parenCount--

        if (char === "," && parenCount === 0) {
          args.push(current.trim())
          current = ""
          continue
        }
      }

      current += char
    }

    if (current.trim()) {
      args.push(current.trim())
    }

    return args
  }

  private static evaluateExpression(expr: string, variables: any): any {
    expr = expr.trim()

    // Handle string literals
    if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
      return expr.substring(1, expr.length - 1)
    }

    // Handle numbers
    if (/^\d+$/.test(expr)) {
      return Number.parseInt(expr)
    }

    if (/^\d+\.\d+$/.test(expr)) {
      return Number.parseFloat(expr)
    }

    // Handle variables
    if (variables.hasOwnProperty(expr)) {
      return variables[expr]
    }

    // Handle method calls
    if (expr.includes(".")) {
      const parts = expr.split(".")
      let obj = variables[parts[0]]

      for (let i = 1; i < parts.length; i++) {
        const part = parts[i]
        if (part === "length" && Array.isArray(obj)) {
          obj = obj.length
        } else if (part === "size" && Array.isArray(obj)) {
          obj = obj.length
        } else if (part === "upcase" && typeof obj === "string") {
          obj = obj.toUpperCase()
        } else if (part === "downcase" && typeof obj === "string") {
          obj = obj.toLowerCase()
        } else if (part === "reverse" && typeof obj === "string") {
          obj = obj.split("").reverse().join("")
        } else if (obj && typeof obj === "object") {
          obj = obj[part]
        }
      }
      return obj
    }

    // Handle simple arithmetic
    if (expr.includes("+") || expr.includes("-") || expr.includes("*") || expr.includes("/")) {
      try {
        let evalExpr = expr
        for (const [varName, value] of Object.entries(variables)) {
          evalExpr = evalExpr.replace(new RegExp(`\\b${varName}\\b`, "g"), String(value))
        }
        return eval(evalExpr)
      } catch {
        return expr
      }
    }

    return expr
  }
}

export class PHPInterpreter {
  static async execute(code: string): Promise<{ output: string; error?: string; executionTime: number }> {
    const startTime = performance.now()
    let output = ""
    let error = ""

    try {
      // Simple PHP interpreter simulation
      const lines = code.split("\n")
      const variables: { [key: string]: any } = {}
      const classes: { [key: string]: any } = {}
      let inClass = false
      let currentClass = ""

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        if (!line || line.startsWith("//") || line.startsWith("<?php")) {
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

        if (line === "}" && inClass) {
          inClass = false
          currentClass = ""
          continue
        }

        if (!inClass) {
          // Handle echo statements
          if (line.includes("echo ")) {
            const echoMatch = line.match(/echo\s+(.+);/)
            if (echoMatch) {
              let content = echoMatch[1]

              // Handle string concatenation
              if (content.includes(".")) {
                const parts = content.split(".").map((part) => part.trim())
                let result = ""
                for (const part of parts) {
                  if (part.startsWith('"') && part.endsWith('"')) {
                    result += part.substring(1, part.length - 1)
                  } else if (part.startsWith("'") && part.endsWith("'")) {
                    result += part.substring(1, part.length - 1)
                  } else {
                    result += this.evaluateExpression(part, variables)
                  }
                }
                content = result
              } else if (
                (content.startsWith('"') && content.endsWith('"')) ||
                (content.startsWith("'") && content.endsWith("'"))
              ) {
                content = content.substring(1, content.length - 1)
              } else {
                content = this.evaluateExpression(content, variables)
              }

              content = content.replace(/\\n/g, "\n")
              output += content + "\n"
            }
          }

          // Handle printf statements
          else if (line.includes("printf(")) {
            const printfMatch = line.match(/printf\s*$$\s*"([^"]+)"(?:\s*,\s*(.+))?\s*$$;/)
            if (printfMatch) {
              let format = printfMatch[1]
              const args = printfMatch[2] ? this.parseArguments(printfMatch[2]) : []

              // Replace format specifiers
              let argIndex = 0
              format = format.replace(/%[sdif.]+/g, (match) => {
                if (argIndex < args.length) {
                  const arg = args[argIndex++]
                  return this.evaluateExpression(arg, variables)
                }
                return match
              })

              format = format.replace(/\\n/g, "\n")
              output += format
            }
          }

          // Handle variable assignments
          else if (line.includes("$") && line.includes("=")) {
            const varMatch = line.match(/\$(\w+)\s*=\s*(.+);/)
            if (varMatch) {
              const varName = varMatch[1]
              const value = varMatch[2]

              if (value.startsWith("[") && value.endsWith("]")) {
                // Array
                const arrayContent = value.substring(1, value.length - 1)
                const items = arrayContent.split(",").map((item) => this.parseValue(item.trim()))
                variables[varName] = items
              } else if (value.startsWith("new ")) {
                // Object instantiation
                const newMatch = value.match(/new\s+(\w+)$$([^)]*)$$/)
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

          // Handle foreach loops
          else if (line.includes("foreach(") || line.includes("foreach (")) {
            const foreachMatch = line.match(/foreach\s*$$\s*\$(\w+)\s+as\s+(?:\$(\w+)\s*=>\s*)?\$(\w+)\s*$$/)
            if (foreachMatch) {
              const arrayVar = foreachMatch[1]
              const keyVar = foreachMatch[2]
              const valueVar = foreachMatch[3]
              const array = variables[arrayVar]

              // Find loop body
              const loopBody: string[] = []
              i++
              let braceCount = 0
              while (i < lines.length) {
                const bodyLine = lines[i].trim()
                if (bodyLine === "{") {
                  braceCount++
                } else if (bodyLine === "}") {
                  braceCount--
                  if (braceCount < 0) break
                } else if (braceCount > 0) {
                  loopBody.push(bodyLine)
                }
                i++
              }

              // Execute loop
              if (Array.isArray(array)) {
                array.forEach((value, index) => {
                  if (keyVar) variables[keyVar] = index
                  variables[valueVar] = value

                  for (const bodyLine of loopBody) {
                    if (bodyLine.includes("echo ")) {
                      const echoMatch = bodyLine.match(/echo\s+(.+);/)
                      if (echoMatch) {
                        let content = echoMatch[1]

                        if (content.includes(".")) {
                          const parts = content.split(".").map((part) => part.trim())
                          let result = ""
                          for (const part of parts) {
                            if (part.startsWith('"') && part.endsWith('"')) {
                              result += part.substring(1, part.length - 1)
                            } else if (part.startsWith("'") && part.endsWith("'")) {
                              result += part.substring(1, part.length - 1)
                            } else {
                              result += this.evaluateExpression(part, variables)
                            }
                          }
                          content = result
                        } else if (
                          (content.startsWith('"') && content.endsWith('"')) ||
                          (content.startsWith("'") && content.endsWith("'"))
                        ) {
                          content = content.substring(1, content.length - 1)
                        } else {
                          content = this.evaluateExpression(content, variables)
                        }

                        content = content.replace(/\\n/g, "\n")
                        output += content + "\n"
                      }
                    }
                  }
                })
              } else if (typeof array === "object") {
                Object.entries(array).forEach(([key, value]) => {
                  if (keyVar) variables[keyVar] = key
                  variables[valueVar] = value

                  for (const bodyLine of loopBody) {
                    if (bodyLine.includes("echo ")) {
                      const echoMatch = bodyLine.match(/echo\s+(.+);/)
                      if (echoMatch) {
                        let content = echoMatch[1]

                        if (content.includes(".")) {
                          const parts = content.split(".").map((part) => part.trim())
                          let result = ""
                          for (const part of parts) {
                            if (part.startsWith('"') && part.endsWith('"')) {
                              result += part.substring(1, part.length - 1)
                            } else if (part.startsWith("'") && part.endsWith("'")) {
                              result += part.substring(1, part.length - 1)
                            } else {
                              result += this.evaluateExpression(part, variables)
                            }
                          }
                          content = result
                        } else if (
                          (content.startsWith('"') && content.endsWith('"')) ||
                          (content.startsWith("'") && content.endsWith("'"))
                        ) {
                          content = content.substring(1, content.length - 1)
                        } else {
                          content = this.evaluateExpression(content, variables)
                        }

                        content = content.replace(/\\n/g, "\n")
                        output += content + "\n"
                      }
                    }
                  }
                })
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
    if (expr.startsWith("$")) {
      const varName = expr.substring(1)
      if (variables.hasOwnProperty(varName)) {
        return variables[varName]
      }
    }

    // Handle array/object access
    if (expr.includes("->")) {
      const parts = expr.split("->")
      let obj = variables[parts[0].substring(1)] // Remove $

      for (let i = 1; i < parts.length; i++) {
        const part = parts[i]
        if (part.includes("()")) {
          const methodName = part.replace("()", "")
          // Simple method simulation
          if (methodName === "getName" && obj._args) {
            obj = obj._args[0] || ""
          } else if (methodName === "getAge" && obj._args) {
            obj = obj._args[1] || 0
          }
        } else {
          if (obj && typeof obj === "object") {
            obj = obj[part]
          }
        }
      }
      return obj
    }

    return expr
  }
}

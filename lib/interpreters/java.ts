export class JavaInterpreter {
  static async execute(code: string): Promise<{ output: string; error?: string; executionTime: number }> {
    const startTime = performance.now()
    let output = ""
    let error = ""

    try {
      // Simple Java interpreter simulation
      const lines = code.split("\n")
      const variables: { [key: string]: any } = {}
      let inMain = false

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        if (!line || line.startsWith("//") || line.startsWith("import") || line.startsWith("public class")) {
          continue
        }

        if (line.includes("public static void main")) {
          inMain = true
          continue
        }

        if (line === "}" && inMain) {
          break
        }

        if (inMain) {
          // Handle System.out.println statements
          if (line.includes("System.out.println(")) {
            const printMatch = line.match(/System\.out\.println\s*$$\s*(.+)\s*$$;/)
            if (printMatch) {
              let content = printMatch[1]

              // Handle string concatenation
              if (content.includes("+")) {
                const parts = content.split("+").map((part) => part.trim())
                let result = ""
                for (const part of parts) {
                  if (part.startsWith('"') && part.endsWith('"')) {
                    result += part.substring(1, part.length - 1)
                  } else {
                    result += this.evaluateExpression(part, variables)
                  }
                }
                content = result
              } else if (content.startsWith('"') && content.endsWith('"')) {
                content = content.substring(1, content.length - 1)
              } else {
                content = this.evaluateExpression(content, variables)
              }

              output += content + "\n"
            }
          }

          // Handle System.out.printf statements
          else if (line.includes("System.out.printf(")) {
            const printfMatch = line.match(/System\.out\.printf\s*$$\s*"([^"]+)"(?:\s*,\s*(.+))?\s*$$;/)
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

          // Handle variable declarations
          else if (line.match(/^\s*(int|double|float|String|boolean)\s+\w+/)) {
            const varMatch = line.match(/(int|double|float|String|boolean)\s+(\w+)(?:\s*=\s*(.+))?;/)
            if (varMatch) {
              const type = varMatch[1]
              const varName = varMatch[2]
              const value = varMatch[3]

              if (value) {
                variables[varName] = this.parseValue(value, type)
              } else {
                variables[varName] = this.getDefaultValue(type)
              }
            }
          }

          // Handle array declarations
          else if (line.includes("[]") && line.includes("=")) {
            const arrayMatch = line.match(/(int|double|String)\[\]\s+(\w+)\s*=\s*\{([^}]+)\};/)
            if (arrayMatch) {
              const type = arrayMatch[1]
              const varName = arrayMatch[2]
              const values = arrayMatch[3].split(",").map((v) => this.parseValue(v.trim(), type))
              variables[varName] = values
            }
          }

          // Handle for loops
          else if (line.includes("for(") || line.includes("for (")) {
            const forMatch =
              line.match(/for\s*$$\s*(.+?)\s*:\s*(.+?)\s*$$/) ||
              line.match(/for\s*$$\s*int\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<\s*(.+?)\s*;\s*\1\+\+\s*$$/)

            if (forMatch) {
              let iterVar: string
              let iterable: any

              if (forMatch[0].includes(":")) {
                // Enhanced for loop
                iterVar = forMatch[1].split(" ").pop() || ""
                const iterableVar = forMatch[2]
                iterable = variables[iterableVar]
              } else {
                // Traditional for loop
                iterVar = forMatch[1]
                const start = Number.parseInt(forMatch[2])
                const endExpr = forMatch[3]
                const end = this.evaluateExpression(endExpr, variables)
                iterable = Array.from({ length: end - start }, (_, i) => start + i)
              }

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
                } else if (braceCount > 0 || (!bodyLine.includes("{") && !bodyLine.includes("}"))) {
                  loopBody.push(bodyLine)
                }
                i++
              }

              // Execute loop
              if (Array.isArray(iterable)) {
                for (const item of iterable) {
                  variables[iterVar] = item
                  for (const bodyLine of loopBody) {
                    if (bodyLine.includes("System.out.println(")) {
                      const printMatch = bodyLine.match(/System\.out\.println\s*$$\s*(.+)\s*$$;/)
                      if (printMatch) {
                        let content = printMatch[1]

                        if (content.includes("+")) {
                          const parts = content.split("+").map((part) => part.trim())
                          let result = ""
                          for (const part of parts) {
                            if (part.startsWith('"') && part.endsWith('"')) {
                              result += part.substring(1, part.length - 1)
                            } else {
                              result += this.evaluateExpression(part, variables)
                            }
                          }
                          content = result
                        } else if (content.startsWith('"') && content.endsWith('"')) {
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

  private static parseValue(value: string, type: string): any {
    value = value.trim()

    if (type === "String") {
      if (value.startsWith('"') && value.endsWith('"')) {
        return value.substring(1, value.length - 1)
      }
      return value
    }

    if (type === "int") {
      return Number.parseInt(value)
    }

    if (type === "double" || type === "float") {
      return Number.parseFloat(value)
    }

    if (type === "boolean") {
      return value === "true"
    }

    return value
  }

  private static getDefaultValue(type: string): any {
    switch (type) {
      case "int":
        return 0
      case "double":
      case "float":
        return 0.0
      case "boolean":
        return false
      case "String":
        return ""
      default:
        return null
    }
  }

  private static parseArguments(argsStr: string): string[] {
    const args: string[] = []
    let current = ""
    let inString = false
    let parenCount = 0

    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i]

      if (char === '"' && argsStr[i - 1] !== "\\") {
        inString = !inString
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
    if (expr.startsWith('"') && expr.endsWith('"')) {
      return expr.substring(1, expr.length - 1)
    }

    // Handle numbers
    if (/^\d+$/.test(expr)) {
      return Number.parseInt(expr)
    }

    if (/^\d+\.\d+[fd]?$/.test(expr)) {
      return Number.parseFloat(expr)
    }

    // Handle method calls
    if (expr.includes(".")) {
      const parts = expr.split(".")
      let obj = variables[parts[0]]

      for (let i = 1; i < parts.length; i++) {
        const part = parts[i]
        if (part.includes("()")) {
          const methodName = part.replace("()", "")
          if (methodName === "length" && Array.isArray(obj)) {
            obj = obj.length
          } else if (methodName === "size" && Array.isArray(obj)) {
            obj = obj.length
          }
        } else {
          if (obj && typeof obj === "object") {
            obj = obj[part]
          }
        }
      }
      return obj
    }

    // Handle variables
    if (variables.hasOwnProperty(expr)) {
      return variables[expr]
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

export class CInterpreter {
  static async execute(code: string): Promise<{ output: string; error?: string; executionTime: number }> {
    const startTime = performance.now()
    let output = ""
    let error = ""

    try {
      // Simple C interpreter simulation
      const lines = code.split("\n")
      const variables: { [key: string]: any } = {}
      let inMain = false

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        if (!line || line.startsWith("//") || line.startsWith("#include")) {
          continue
        }

        if (line.includes("int main()")) {
          inMain = true
          continue
        }

        if (line === "}" && inMain) {
          break
        }

        if (inMain) {
          // Handle variable declarations
          if (line.match(/^\s*(int|float|double|char)\s+\w+/)) {
            const varMatch = line.match(/(int|float|double|char)\s+(\w+)(?:\s*=\s*(.+))?;/)
            if (varMatch) {
              const type = varMatch[1]
              const varName = varMatch[2]
              const value = varMatch[3]

              if (value) {
                variables[varName] = this.parseValue(value, type)
              } else {
                variables[varName] = type === "int" ? 0 : 0.0
              }
            }
          }

          // Handle array declarations
          else if (line.match(/^\s*(int|float|double)\s+\w+\[\]/)) {
            const arrayMatch = line.match(/(int|float|double)\s+(\w+)\[\]\s*=\s*\{([^}]+)\};/)
            if (arrayMatch) {
              const varName = arrayMatch[2]
              const values = arrayMatch[3].split(",").map((v) => Number.parseFloat(v.trim()))
              variables[varName] = values
              variables[varName + "_size"] = values.length
            }
          }

          // Handle printf statements
          else if (line.includes("printf(")) {
            const printfMatch = line.match(/printf\s*$$\s*"([^"]+)"(?:\s*,\s*(.+))?\s*$$;/)
            if (printfMatch) {
              let format = printfMatch[1]
              const args = printfMatch[2] ? printfMatch[2].split(",").map((arg) => arg.trim()) : []

              // Replace format specifiers
              let argIndex = 0
              format = format.replace(/%[difs]/g, (match) => {
                if (argIndex < args.length) {
                  const arg = args[argIndex++]
                  return this.evaluateExpression(arg, variables)
                }
                return match
              })

              format = format.replace(/\\n/g, "\n")
              output += format + "\n"
            }
          }

          // Handle for loops
          else if (line.includes("for(")) {
            const forMatch = line.match(/for\s*$$\s*int\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<\s*(.+?)\s*;\s*\1\+\+\s*$$/)
            if (forMatch) {
              const iterVar = forMatch[1]
              const start = Number.parseInt(forMatch[2])
              const endExpr = forMatch[3]
              const end = this.evaluateExpression(endExpr, variables)

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
              for (let j = start; j < end; j++) {
                variables[iterVar] = j
                for (const bodyLine of loopBody) {
                  if (bodyLine.includes("printf(")) {
                    const printfMatch = bodyLine.match(/printf\s*$$\s*"([^"]+)"(?:\s*,\s*(.+))?\s*$$;/)
                    if (printfMatch) {
                      let format = printfMatch[1]
                      const args = printfMatch[2] ? printfMatch[2].split(",").map((arg) => arg.trim()) : []

                      let argIndex = 0
                      format = format.replace(/%[difs]/g, (match) => {
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
                }
              }
            }
          }

          // Handle assignments
          else if (line.includes("=") && !line.includes("==")) {
            const assignMatch = line.match(/(\w+)\s*=\s*(.+);/)
            if (assignMatch) {
              const varName = assignMatch[1]
              const expression = assignMatch[2]
              variables[varName] = this.evaluateExpression(expression, variables)
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
    if (type === "int") {
      return Number.parseInt(value)
    } else if (type === "float" || type === "double") {
      return Number.parseFloat(value)
    }
    return value
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

    if (/^\d+\.\d+f?$/.test(expr)) {
      return Number.parseFloat(expr)
    }

    // Handle variables
    if (variables.hasOwnProperty(expr)) {
      return variables[expr]
    }

    // Handle sizeof
    if (expr.includes("sizeof(")) {
      const sizeofMatch = expr.match(/sizeof$$(\w+)$$\s*\/\s*sizeof$$\1\[0\]$$/)
      if (sizeofMatch) {
        const varName = sizeofMatch[1]
        return variables[varName + "_size"] || 0
      }
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

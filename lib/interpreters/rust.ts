export class RustInterpreter {
  static async execute(code: string): Promise<{ output: string; error?: string; executionTime: number }> {
    const startTime = performance.now()
    let output = ""
    let error = ""

    try {
      // Simple Rust interpreter simulation
      const lines = code.split("\n")
      const variables: { [key: string]: any } = {}
      const structs: { [key: string]: any } = {}
      let inMain = false

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        if (!line || line.startsWith("//")) {
          continue
        }

        // Handle struct definitions
        if (line.startsWith("struct ")) {
          const structMatch = line.match(/struct\s+(\w+)\s*\{/)
          if (structMatch) {
            const structName = structMatch[1]
            const fields: { [key: string]: string } = {}

            i++
            while (i < lines.length && !lines[i].trim().startsWith("}")) {
              const fieldLine = lines[i].trim()
              if (fieldLine && fieldLine.includes(":")) {
                const [fieldName, fieldType] = fieldLine
                  .replace(",", "")
                  .split(":")
                  .map((s) => s.trim())
                fields[fieldName] = fieldType
              }
              i++
            }

            structs[structName] = fields
          }
          continue
        }

        if (line.includes("fn main()")) {
          inMain = true
          continue
        }

        if (line === "}" && inMain) {
          break
        }

        if (inMain) {
          // Handle println! macro
          if (line.includes("println!(")) {
            const printMatch = line.match(/println!\s*$$\s*"([^"]+)"(?:\s*,\s*(.+))?\s*$$;/)
            if (printMatch) {
              let format = printMatch[1]
              const args = printMatch[2] ? this.parseArguments(printMatch[2]) : []

              // Replace format specifiers
              let argIndex = 0
              format = format.replace(/\{[^}]*\}/g, (match) => {
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

          // Handle variable declarations
          else if (line.includes("let ")) {
            const letMatch = line.match(/let\s+(?:mut\s+)?(\w+)\s*=\s*(.+);/)
            if (letMatch) {
              const varName = letMatch[1]
              const value = letMatch[2]

              if (value.startsWith("vec![")) {
                // Vector initialization
                const vecContent = value.match(/vec!\[([^\]]*)\]/)
                if (vecContent) {
                  const items = vecContent[1].split(",").map((item) => this.parseValue(item.trim()))
                  variables[varName] = items
                }
              } else if (value.includes("::new(")) {
                // Struct initialization
                const structMatch = value.match(/(\w+)::new$$([^)]*)$$/)
                if (structMatch) {
                  const structType = structMatch[1]
                  const args = structMatch[2] ? this.parseArguments(structMatch[2]) : []
                  const instance: { [key: string]: any } = { _type: structType }

                  // Simple field assignment based on order
                  const structDef = structs[structType]
                  if (structDef) {
                    const fieldNames = Object.keys(structDef)
                    args.forEach((arg, index) => {
                      if (index < fieldNames.length) {
                        instance[fieldNames[index]] = this.parseValue(arg)
                      }
                    })
                  }

                  variables[varName] = instance
                }
              } else {
                variables[varName] = this.parseValue(value)
              }
            }
          }

          // Handle for loops
          else if (line.includes("for ") && line.includes(" in ")) {
            const forMatch = line.match(/for\s+(\w+)\s+in\s+(.+)\s*\{/)
            if (forMatch) {
              const iterVar = forMatch[1]
              const iterableExpr = forMatch[2]

              let iterable
              if (iterableExpr.includes("..")) {
                // Range
                const rangeMatch = iterableExpr.match(/(\d+)\.\.(\d+)/)
                if (rangeMatch) {
                  const start = Number.parseInt(rangeMatch[1])
                  const end = Number.parseInt(rangeMatch[2])
                  iterable = Array.from({ length: end - start }, (_, i) => start + i)
                }
              } else {
                iterable = this.evaluateExpression(iterableExpr, variables)
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
                } else if (braceCount >= 0) {
                  loopBody.push(bodyLine)
                }
                i++
              }

              // Execute loop
              if (Array.isArray(iterable)) {
                for (const item of iterable) {
                  variables[iterVar] = item
                  for (const bodyLine of loopBody) {
                    if (bodyLine.includes("println!(")) {
                      const printMatch = bodyLine.match(/println!\s*$$\s*"([^"]+)"(?:\s*,\s*(.+))?\s*$$;/)
                      if (printMatch) {
                        let format = printMatch[1]
                        const args = printMatch[2] ? this.parseArguments(printMatch[2]) : []

                        let argIndex = 0
                        format = format.replace(/\{[^}]*\}/g, (match) => {
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

    if (value.startsWith('"') && value.endsWith('"')) {
      return value.substring(1, value.length - 1)
    }

    if (/^\d+$/.test(value)) {
      return Number.parseInt(value)
    }

    if (/^\d+\.\d+$/.test(value)) {
      return Number.parseFloat(value)
    }

    return value
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

    if (/^\d+\.\d+$/.test(expr)) {
      return Number.parseFloat(expr)
    }

    // Handle variables
    if (variables.hasOwnProperty(expr)) {
      return variables[expr]
    }

    return expr
  }
}

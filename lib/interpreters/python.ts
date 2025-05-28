export class PythonInterpreter {
  static async execute(code: string): Promise<{ output: string; error?: string; executionTime: number }> {
    const startTime = performance.now()
    let output = ""
    let error = ""

    try {
      // Simple Python interpreter simulation
      const lines = code.split("\n")
      const variables: { [key: string]: any } = {}
      const functions: { [key: string]: { params: string[]; body: string[] } } = {}

      let i = 0
      while (i < lines.length) {
        const line = lines[i].trim()

        if (!line || line.startsWith("#")) {
          i++
          continue
        }

        try {
          // Handle function definitions
          if (line.startsWith("def ")) {
            const funcMatch = line.match(/def\s+(\w+)\s*$$([^)]*)$$\s*:/)
            if (funcMatch) {
              const funcName = funcMatch[1]
              const params = funcMatch[2]
                .split(",")
                .map((p) => p.trim())
                .filter((p) => p)
              const body: string[] = []

              i++
              while (i < lines.length && (lines[i].startsWith("    ") || lines[i].trim() === "")) {
                if (lines[i].trim()) {
                  body.push(lines[i].substring(4)) // Remove indentation
                }
                i++
              }

              functions[funcName] = { params, body }
              continue
            }
          }

          // Handle print statements
          if (line.includes("print(")) {
            const printMatch = line.match(/print\s*$$\s*(.+)\s*$$/)
            if (printMatch) {
              let content = printMatch[1]

              // Handle f-strings
              if (content.startsWith('f"') || content.startsWith("f'")) {
                content = content.substring(2, content.length - 1)
                content = content.replace(/\{([^}]+)\}/g, (match, expr) => {
                  return this.evaluateExpression(expr, variables, functions)
                })
              } else if (content.startsWith('"') || content.startsWith("'")) {
                content = content.substring(1, content.length - 1)
              } else {
                content = this.evaluateExpression(content, variables, functions)
              }

              output += content.replace(/\\n/g, "\n") + "\n"
            }
          }

          // Handle variable assignments
          else if (line.includes("=") && !line.includes("==")) {
            const [varName, expression] = line.split("=").map((s) => s.trim())

            if (expression.startsWith("[") && expression.endsWith("]")) {
              // List comprehension or regular list
              if (expression.includes("for")) {
                const listCompMatch = expression.match(/\[(.+)\s+for\s+(\w+)\s+in\s+(.+)\]/)
                if (listCompMatch) {
                  const expr = listCompMatch[1]
                  const iterVar = listCompMatch[2]
                  const iterableExpr = listCompMatch[3]

                  const iterable = this.evaluateExpression(iterableExpr, variables, functions)
                  const result = []

                  if (Array.isArray(iterable)) {
                    for (const item of iterable) {
                      variables[iterVar] = item
                      result.push(this.evaluateExpression(expr, variables, functions))
                    }
                  }

                  variables[varName] = result
                }
              } else {
                // Regular list
                const listContent = expression.substring(1, expression.length - 1)
                const items = listContent
                  .split(",")
                  .map((item) => this.evaluateExpression(item.trim(), variables, functions))
                variables[varName] = items
              }
            } else if (expression.startsWith("{") && expression.endsWith("}")) {
              // Dictionary
              const dictContent = expression.substring(1, expression.length - 1)
              const pairs = dictContent.split(",")
              const dict: { [key: string]: any } = {}

              for (const pair of pairs) {
                const [key, value] = pair.split(":").map((s) => s.trim())
                const keyStr = key.replace(/['"]/g, "")
                dict[keyStr] = this.evaluateExpression(value, variables, functions)
              }

              variables[varName] = dict
            } else {
              variables[varName] = this.evaluateExpression(expression, variables, functions)
            }
          }

          // Handle for loops
          else if (line.startsWith("for ")) {
            const forMatch = line.match(/for\s+(\w+)\s+in\s+(.+):/)
            if (forMatch) {
              const iterVar = forMatch[1]
              const iterableExpr = forMatch[2]

              let iterable
              if (iterableExpr.startsWith("range(")) {
                const rangeMatch = iterableExpr.match(/range$$(\d+)$$/)
                if (rangeMatch) {
                  const n = Number.parseInt(rangeMatch[1])
                  iterable = Array.from({ length: n }, (_, i) => i)
                }
              } else {
                iterable = this.evaluateExpression(iterableExpr, variables, functions)
              }

              if (Array.isArray(iterable)) {
                const loopBody: string[] = []
                i++
                while (i < lines.length && (lines[i].startsWith("    ") || lines[i].trim() === "")) {
                  if (lines[i].trim()) {
                    loopBody.push(lines[i].substring(4))
                  }
                  i++
                }

                for (const item of iterable) {
                  variables[iterVar] = item
                  for (const bodyLine of loopBody) {
                    await this.executeLine(bodyLine, variables, functions, (out) => (output += out))
                  }
                }
                continue
              }
            }
          }
        } catch (lineError) {
          error += `Line ${i + 1}: ${lineError}\n`
        }

        i++
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

  private static async executeLine(
    line: string,
    variables: any,
    functions: any,
    outputCallback: (output: string) => void,
  ) {
    if (line.includes("print(")) {
      const printMatch = line.match(/print\s*$$\s*(.+)\s*$$/)
      if (printMatch) {
        let content = printMatch[1]

        if (content.startsWith('f"') || content.startsWith("f'")) {
          content = content.substring(2, content.length - 1)
          content = content.replace(/\{([^}]+)\}/g, (match, expr) => {
            return this.evaluateExpression(expr, variables, functions)
          })
        } else if (content.startsWith('"') || content.startsWith("'")) {
          content = content.substring(1, content.length - 1)
        } else {
          content = this.evaluateExpression(content, variables, functions)
        }

        outputCallback(content.replace(/\\n/g, "\n") + "\n")
      }
    }
  }

  private static evaluateExpression(expr: string, variables: any, functions: any): any {
    expr = expr.trim()

    // Handle function calls
    const funcCallMatch = expr.match(/(\w+)\s*$$([^)]*)$$/)
    if (funcCallMatch) {
      const funcName = funcCallMatch[1]
      const args = funcCallMatch[2].split(",").map((arg) => this.evaluateExpression(arg.trim(), variables, functions))

      if (functions[funcName]) {
        const func = functions[funcName]
        const localVars = { ...variables }

        // Set parameters
        for (let i = 0; i < func.params.length; i++) {
          localVars[func.params[i]] = args[i]
        }

        // Execute function body (simplified)
        for (const bodyLine of func.body) {
          if (bodyLine.startsWith("return ")) {
            const returnExpr = bodyLine.substring(7)
            return this.evaluateExpression(returnExpr, localVars, functions)
          }
        }
      }
    }

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

    // Handle simple arithmetic
    if (expr.includes("+") || expr.includes("-") || expr.includes("*") || expr.includes("/") || expr.includes("**")) {
      try {
        // Replace variables in expression
        let evalExpr = expr
        for (const [varName, value] of Object.entries(variables)) {
          evalExpr = evalExpr.replace(new RegExp(`\\b${varName}\\b`, "g"), String(value))
        }
        evalExpr = evalExpr.replace(/\*\*/g, "**")
        return eval(evalExpr)
      } catch {
        return expr
      }
    }

    return expr
  }
}

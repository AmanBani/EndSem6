export class GoInterpreter {
  static async execute(code: string): Promise<{ output: string; error?: string; executionTime: number }> {
    const startTime = performance.now()
    let output = ""
    let error = ""

    try {
      // Simple Go interpreter simulation
      const lines = code.split("\n")
      const variables: { [key: string]: any } = {}
      const structs: { [key: string]: { [key: string]: any } } = {}
      const methods: { [key: string]: any } = {}
      let inMain = false

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        if (!line || line.startsWith("//") || line.startsWith("package") || line.startsWith("import")) {
          continue
        }

        // Handle struct definitions
        if (line.startsWith("type ") && line.includes("struct")) {
          const structMatch = line.match(/type\s+(\w+)\s+struct/)
          if (structMatch) {
            const structName = structMatch[1]
            const fields: { [key: string]: string } = {}

            i++
            while (i < lines.length && !lines[i].trim().startsWith("}")) {
              const fieldLine = lines[i].trim()
              if (fieldLine) {
                const fieldMatch = fieldLine.match(/(\w+)\s+(\w+)/)
                if (fieldMatch) {
                  fields[fieldMatch[1]] = fieldMatch[2]
                }
              }
              i++
            }

            structs[structName] = fields
          }
          continue
        }

        // Handle method definitions
        if (line.startsWith("func (")) {
          const methodMatch = line.match(/func\s+$$(\w+)\s+(\w+)$$\s+(\w+)$$[^)]*$$\s*(\w+)?/)
          if (methodMatch) {
            const receiver = methodMatch[1]
            const receiverType = methodMatch[2]
            const methodName = methodMatch[3]
            const returnType = methodMatch[4]

            const methodBody: string[] = []
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
                methodBody.push(bodyLine)
              }
              i++
            }

            methods[`${receiverType}.${methodName}`] = {
              receiver,
              body: methodBody,
              returnType,
            }
          }
          continue
        }

        if (line.includes("func main()")) {
          inMain = true
          continue
        }

        if (line === "}" && inMain) {
          break
        }

        if (inMain) {
          // Handle variable declarations
          if (line.includes(":=")) {
            const assignMatch = line.match(/(\w+)\s*:=\s*(.+)/)
            if (assignMatch) {
              const varName = assignMatch[1]
              const value = assignMatch[2]

              if (value.includes("{")) {
                // Struct initialization
                const structMatch = value.match(/(\w+)\{([^}]*)\}/)
                if (structMatch) {
                  const structType = structMatch[1]
                  const fieldValues = structMatch[2]
                  const instance: { [key: string]: any } = { _type: structType }

                  if (fieldValues.trim()) {
                    const fields = fieldValues.split(",")
                    const structDef = structs[structType]
                    const fieldNames = Object.keys(structDef)

                    fields.forEach((field, index) => {
                      if (index < fieldNames.length) {
                        const fieldName = fieldNames[index]
                        instance[fieldName] = this.parseValue(field.trim())
                      }
                    })
                  }

                  variables[varName] = instance
                }
              } else if (value.startsWith("[]")) {
                // Slice initialization
                const sliceMatch = value.match(/\[\](\w+)\{([^}]*)\}/)
                if (sliceMatch) {
                  const values = sliceMatch[2].split(",").map((v) => this.parseValue(v.trim()))
                  variables[varName] = values
                }
              } else {
                variables[varName] = this.parseValue(value)
              }
            }
          }

          // Handle fmt.Printf statements
          else if (line.includes("fmt.Printf(")) {
            const printfMatch = line.match(/fmt\.Printf\s*$$\s*"([^"]+)"(?:\s*,\s*(.+))?\s*$$/)
            if (printfMatch) {
              let format = printfMatch[1]
              const args = printfMatch[2] ? this.parseArguments(printfMatch[2]) : []

              // Replace format specifiers
              let argIndex = 0
              format = format.replace(/%[vdfs.]+/g, (match) => {
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

          // Handle fmt.Println statements
          else if (line.includes("fmt.Println(")) {
            const printlnMatch = line.match(/fmt\.Println\s*$$\s*(.+)\s*$$/)
            if (printlnMatch) {
              const args = this.parseArguments(printlnMatch[1])
              const values = args.map((arg) => this.evaluateExpression(arg, variables))
              output += values.join(" ") + "\n"
            }
          }

          // Handle method calls
          else if (line.includes(".") && line.includes("()")) {
            const methodCallMatch = line.match(/(\w+)\.(\w+)$$$$/)
            if (methodCallMatch) {
              const objName = methodCallMatch[1]
              const methodName = methodCallMatch[2]
              const obj = variables[objName]

              if (obj && obj._type) {
                const methodKey = `${obj._type}.${methodName}`
                const method = methods[methodKey]

                if (method) {
                  // Execute method
                  const result = this.executeMethod(method, obj, variables)
                  if (result !== undefined) {
                    output += result + "\n"
                  }
                }
              }
            }
          }

          // Handle for range loops
          else if (line.includes("for ") && line.includes("range")) {
            const rangeMatch = line.match(/for\s+(\w+)(?:\s*,\s*(\w+))?\s*:=\s*range\s+(\w+)/)
            if (rangeMatch) {
              const keyVar = rangeMatch[1]
              const valueVar = rangeMatch[2]
              const iterableVar = rangeMatch[3]
              const iterable = variables[iterableVar]

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
              if (Array.isArray(iterable)) {
                iterable.forEach((value, index) => {
                  variables[keyVar] = index
                  if (valueVar) variables[valueVar] = value

                  for (const bodyLine of loopBody) {
                    if (bodyLine.includes("fmt.Printf(")) {
                      const printfMatch = bodyLine.match(/fmt\.Printf\s*$$\s*"([^"]+)"(?:\s*,\s*(.+))?\s*$$/)
                      if (printfMatch) {
                        let format = printfMatch[1]
                        const args = printfMatch[2] ? this.parseArguments(printfMatch[2]) : []

                        let argIndex = 0
                        format = format.replace(/%[vdfs.]+/g, (match) => {
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
                })
              } else if (typeof iterable === "object") {
                Object.entries(iterable).forEach(([key, value]) => {
                  if (key !== "_type") {
                    variables[keyVar] = key
                    if (valueVar) variables[valueVar] = value

                    for (const bodyLine of loopBody) {
                      if (bodyLine.includes("fmt.Printf(")) {
                        const printfMatch = bodyLine.match(/fmt\.Printf\s*$$\s*"([^"]+)"(?:\s*,\s*(.+))?\s*$$/)
                        if (printfMatch) {
                          let format = printfMatch[1]
                          const args = printfMatch[2] ? this.parseArguments(printfMatch[2]) : []

                          let argIndex = 0
                          format = format.replace(/%[vdfs.]+/g, (match) => {
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

    // Handle object field access
    if (expr.includes(".")) {
      const parts = expr.split(".")
      let obj = variables[parts[0]]
      for (let i = 1; i < parts.length; i++) {
        if (obj && typeof obj === "object") {
          obj = obj[parts[i]]
        }
      }
      return obj
    }

    // Handle variables
    if (variables.hasOwnProperty(expr)) {
      return variables[expr]
    }

    return expr
  }

  private static executeMethod(method: any, obj: any, variables: any): any {
    // Simple method execution simulation
    for (const line of method.body) {
      if (line.includes("return ")) {
        const returnExpr = line.replace("return ", "").replace(/[;{}]/g, "").trim()

        // Handle math operations
        if (returnExpr.includes("math.Pi")) {
          let expr = returnExpr.replace(/math\.Pi/g, String(Math.PI))

          // Replace object fields
          for (const [key, value] of Object.entries(obj)) {
            if (key !== "_type") {
              expr = expr.replace(new RegExp(`\\b${method.receiver}\\.${key}\\b`, "g"), String(value))
            }
          }

          try {
            return eval(expr)
          } catch {
            return returnExpr
          }
        }

        return this.evaluateExpression(returnExpr, { ...variables, [method.receiver]: obj })
      }
    }

    return undefined
  }
}

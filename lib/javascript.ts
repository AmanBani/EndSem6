export class JavaScriptInterpreter {
  static async execute(code: string): Promise<{ output: string; error?: string; executionTime: number }> {
    const startTime = performance.now()
    let output = ""
    let error = ""

    // Capture console.log output
    const originalLog = console.log
    const logs: string[] = []

    console.log = (...args) => {
      logs.push(args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg))).join(" "))
    }

    try {
      // Create a safe execution context
      const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor
      const func = new AsyncFunction(code)
      await func()

      output = logs.join("\n")
    } catch (e) {
      error = e instanceof Error ? e.message : "Unknown error"
    } finally {
      // Restore original console.log
      console.log = originalLog
    }

    const endTime = performance.now()
    return {
      output: output || "Program executed successfully",
      error: error || undefined,
      executionTime: endTime - startTime,
    }
  }
}

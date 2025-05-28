  "use client"

  import { useState, useEffect, useCallback } from "react"
  import { Button } from "@/components/ui/button"
  import { Card } from "@/components/ui/card"
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
  import { Textarea } from "@/components/ui/textarea"
  import { Badge } from "@/components/ui/badge"
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
  import { Separator } from "@/components/ui/separator"
  import {
    Play,
    Terminal,
    Copy,
    Download,
    Settings,
    Clock,
    FileCode,
    Code2,
    ChevronRight,
    Activity,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Zap,
    Square,
  } from "lucide-react"
  import { PythonInterpreter } from "@/lib/interpreters/python"
  import { CInterpreter } from "@/lib/interpreters/c"
  import { GoInterpreter } from "@/lib/interpreters/go"
  import { JavaScriptInterpreter } from "@/lib/interpreters/javascript"
  import { RustInterpreter } from "@/lib/interpreters/rust"
  import { JavaInterpreter } from "@/lib/interpreters/java"
  import { TypeScriptInterpreter } from "@/lib/interpreters/typescript"
  import { PHPInterpreter } from "@/lib/interpreters/php"
  import { RubyInterpreter } from "@/lib/interpreters/ruby"
  import { sampleCode } from "@/lib/sample-code"

  type Language = "python" | "c" | "cpp" | "javascript" | "go" | "rust" | "java" | "typescript" | "php" | "ruby"

  interface ExecutionResult {
    output: string
    error?: string
    executionTime: number
  }

  const languageConfig = {
    python: {
      name: "Python",
      icon: "🐍",
      extension: "py",
    },
    javascript: {
      name: "JavaScript",
      icon: "⚡",
      extension: "js",
    },
    typescript: {
      name: "TypeScript",
      icon: "📘",
      extension: "ts",
    },
    c: {
      name: "C",
      icon: "⚙️",
      extension: "c",
    },
    cpp: {
      name: "C++",
      icon: "🔧",
      extension: "cpp",
    },
    go: {
      name: "Go",
      icon: "🚀",
      extension: "go",
    },
    rust: {
      name: "Rust",
      icon: "🦀",
      extension: "rs",
    },
    java: {
      name: "Java",
      icon: "☕",
      extension: "java",
    },
    php: {
      name: "PHP",
      icon: "🐘",
      extension: "php",
    },
    ruby: {
      name: "Ruby",
      icon: "💎",
      extension: "rb",
    },
  }

  export default function JITCompiler() {
    const [selectedLanguage, setSelectedLanguage] = useState<Language>("python")
    const [code, setCode] = useState("")
    const [output, setOutput] = useState("")
    const [error, setError] = useState("")
    const [isExecuting, setIsExecuting] = useState(false)
    const [executionTime, setExecutionTime] = useState(0)
    const [autoRun, setAutoRun] = useState(false)
    const [activeTab, setActiveTab] = useState("output")
    const [lastExecutionStatus, setLastExecutionStatus] = useState<"success" | "error" | "idle">("idle")

    // Initialize with sample code
    useEffect(() => {
      setCode(sampleCode[selectedLanguage])
      setOutput("")
      setError("")
      setLastExecutionStatus("idle")
    }, [selectedLanguage])

    // Auto-run functionality with debounce
    useEffect(() => {
      if (!autoRun) return

      const timeoutId = setTimeout(() => {
        executeCode()
      }, 1500)

      return () => clearTimeout(timeoutId)
    }, [code, autoRun])

    const executeCode = useCallback(async () => {
      if (!code.trim()) {
        setOutput("")
        setError("No code to execute")
        setLastExecutionStatus("error")
        return
      }

      setIsExecuting(true)
      setError("")
      setOutput("")
      const startTime = performance.now()

      try {
        let result: ExecutionResult

        switch (selectedLanguage) {
          case "python":
            result = await PythonInterpreter.execute(code)
            break
          case "c":
          case "cpp":
            result = await CInterpreter.execute(code)
            break
          case "javascript":
            result = await JavaScriptInterpreter.execute(code)
            break
          case "typescript":
            result = await TypeScriptInterpreter.execute(code)
            break
          case "go":
            result = await GoInterpreter.execute(code)
            break
          case "rust":
            result = await RustInterpreter.execute(code)
            break
          case "java":
            result = await JavaInterpreter.execute(code)
            break
          case "php":
            result = await PHPInterpreter.execute(code)
            break
          case "ruby":
            result = await RubyInterpreter.execute(code)
            break
          default:
            result = { output: "Language not supported yet", executionTime: 0 }
        }

        const endTime = performance.now()
        setExecutionTime(endTime - startTime)

        if (result.error) {
          setError(result.error)
          setOutput("")
          setLastExecutionStatus("error")
          setActiveTab("terminal")
        } else {
          setOutput(result.output)
          setError("")
          setLastExecutionStatus("success")
          setActiveTab("output")
        }
      } catch (executionError) {
        const errorMessage = executionError instanceof Error ? executionError.message : "Unknown error"
        setError(errorMessage)
        setOutput("")
        setLastExecutionStatus("error")
        setActiveTab("terminal")
      } finally {
        setIsExecuting(false)
      }
    }, [code, selectedLanguage])

    const stopExecution = () => {
      setIsExecuting(false)
      setError("Execution stopped by user")
      setLastExecutionStatus("error")
      setActiveTab("terminal")
    }

    const loadSampleCode = () => {
      setCode(sampleCode[selectedLanguage])
    }

    const copyCode = () => {
      navigator.clipboard.writeText(code)
    }

    const downloadCode = () => {
      const extension = languageConfig[selectedLanguage].extension
      const blob = new Blob([code], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `code.${extension}`
      a.click()
      URL.revokeObjectURL(url)
    }

    const clearOutput = () => {
      setOutput("")
      setError("")
      setLastExecutionStatus("idle")
    }

    const currentLang = languageConfig[selectedLanguage]

    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <header className="border-b border-gray-800 bg-gray-950">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="bg-white p-2 rounded-lg">
                      <Code2 className="h-6 w-6 text-black" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">CodeRunner</h1>
                    <p className="text-sm text-gray-400">Real-time Code Execution Platform</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  <Zap className="h-3 w-3 mr-1" />
                  Live Execution
                </Badge>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <label className="text-sm text-gray-300 font-medium">Auto-run:</label>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={autoRun}
                      onChange={(e) => setAutoRun(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      onClick={() => setAutoRun(!autoRun)}
                      className={`w-11 h-6 rounded-full cursor-pointer transition-all duration-300 ${
                        autoRun ? "bg-white" : "bg-gray-600"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-black rounded-full shadow-lg transform transition-transform duration-300 mt-1 ${
                          autoRun ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <Select value={selectedLanguage} onValueChange={(value: Language) => setSelectedLanguage(value)}>
                  <SelectTrigger className="w-48 bg-gray-900 border-gray-700 hover:bg-gray-800 transition-all">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{currentLang.icon}</span>
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {Object.entries(languageConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key} className="hover:bg-gray-800">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{config.icon}</span>
                          <span>{config.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
            {/* Code Editor Panel */}
            <Card className="bg-gray-950 border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-white" />
                    <div>
                      <h2 className="text-lg font-semibold text-white">Code Editor</h2>
                      <p className="text-sm text-gray-400">
                        {currentLang.name} • {code.split("\n").length} lines
                      </p>
                    </div>
                    <Badge variant="outline" className="border-gray-600 text-gray-300">
                      <FileCode className="h-3 w-3 mr-1" />.{currentLang.extension}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadSampleCode}
                      className="border-gray-700 bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Sample
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyCode}
                      className="border-gray-700 bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadCode}
                      className="border-gray-700 bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 h-full">
                <div className="relative h-full">
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={`Write your ${currentLang.name} code here...`}
                    className="w-full h-full min-h-[450px] bg-black border-gray-700 font-mono text-sm resize-none focus:ring-2 focus:ring-white text-gray-100 placeholder:text-gray-500"
                    style={{ fontFamily: 'JetBrains Mono, Monaco, Consolas, "Courier New", monospace' }}
                  />
                  <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">
                    {code.length} chars
                  </div>
                </div>
              </div>

              {/* Run Button Section */}
              <div className="p-4 border-t border-gray-800 bg-gray-950">
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={isExecuting ? stopExecution : executeCode}
                    disabled={!code.trim()}
                    className={`flex-1 font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] ${
                      isExecuting ? "bg-red-600 hover:bg-red-700 text-white" : "bg-white hover:bg-gray-200 text-black"
                    }`}
                  >
                    {isExecuting ? (
                      <>
                        <Square className="h-5 w-5 mr-3" />
                        Stop Execution
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 mr-3" />
                        Run Code
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={clearOutput}
                    className="border-gray-700 bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    Clear
                  </Button>

                  {/* Status Indicator */}
                  <div className="flex items-center space-x-2">
                    {lastExecutionStatus === "success" && <CheckCircle className="h-5 w-5 text-green-400" />}
                    {lastExecutionStatus === "error" && <XCircle className="h-5 w-5 text-red-400" />}
                    {isExecuting && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />}
                  </div>
                </div>
              </div>
            </Card>

            {/* Output Panel */}
            <Card className="bg-gray-950 border-gray-800 overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Terminal className="h-6 w-6 text-white" />
                      <div>
                        <h2 className="text-lg font-semibold text-white">Console</h2>
                        <p className="text-sm text-gray-400">Output and error logs</p>
                      </div>
                    </div>
                    {executionTime > 0 && (
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        <Clock className="h-3 w-3 mr-1" />
                        {executionTime.toFixed(2)}ms
                      </Badge>
                    )}
                  </div>

                  <TabsList className="grid w-full grid-cols-3 bg-gray-900">
                    <TabsTrigger
                      value="output"
                      className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Output
                    </TabsTrigger>
                    <TabsTrigger
                      value="terminal"
                      className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Terminal
                      {error && <div className="w-2 h-2 bg-red-500 rounded-full ml-2" />}
                    </TabsTrigger>
                    <TabsTrigger value="stats" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white">
                      <Activity className="h-4 w-4 mr-2" />
                      Stats
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="output" className="flex-1 p-4">
                  <div className="bg-black rounded-lg p-4 h-full border border-gray-800">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-sm text-gray-400 font-mono">stdout</span>
                    </div>
                    <pre className="text-sm font-mono whitespace-pre-wrap text-green-400 h-full overflow-auto leading-relaxed">
                      {output || (
                        <span className="text-gray-500 italic">
                          Ready to execute your code...
                          <br />
                          <br />💡 Tips:
                          <br />• Click "Run Code" to execute
                          <br />• Enable auto-run for real-time execution
                          <br />• Check the terminal tab for errors
                        </span>
                      )}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="terminal" className="flex-1 p-4">
                  <div className="bg-black rounded-lg p-4 h-full border border-gray-800">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className={`w-3 h-3 rounded-full ${error ? "bg-red-500" : "bg-gray-600"}`} />
                      <span className="text-sm text-gray-400 font-mono">stderr</span>
                    </div>
                    <pre className="text-sm font-mono whitespace-pre-wrap text-red-400 h-full overflow-auto leading-relaxed">
                      {error || (
                        <span className="text-gray-500 italic">
                          No errors detected.
                          <br />
                          <br />🔍 Error information will appear here:
                          <br />• Syntax errors
                          <br />• Runtime exceptions
                          <br />• Compilation errors
                        </span>
                      )}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="flex-1 p-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black rounded-lg p-4 border border-gray-800">
                        <div className="text-2xl font-bold text-white">{code.split("\n").length}</div>
                        <div className="text-sm text-gray-400">Lines of Code</div>
                      </div>
                      <div className="bg-black rounded-lg p-4 border border-gray-800">
                        <div className="text-2xl font-bold text-white">{code.length}</div>
                        <div className="text-sm text-gray-400">Characters</div>
                      </div>
                    </div>

                    <Separator className="bg-gray-800" />

                    <div className="bg-black rounded-lg p-4 border border-gray-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Language</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{currentLang.icon}</span>
                          <span className="text-white font-medium">{currentLang.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Status</span>
                        <div className="flex items-center space-x-2">
                          {lastExecutionStatus === "success" && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-400" />
                              <span className="text-green-400 font-medium">Success</span>
                            </>
                          )}
                          {lastExecutionStatus === "error" && (
                            <>
                              <XCircle className="h-4 w-4 text-red-400" />
                              <span className="text-red-400 font-medium">Error</span>
                            </>
                          )}
                          {lastExecutionStatus === "idle" && (
                            <>
                              <div className="w-4 h-4 bg-gray-600 rounded-full" />
                              <span className="text-gray-400 font-medium">Ready</span>
                            </>
                          )}
                          {isExecuting && (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                              <span className="text-yellow-400 font-medium">Running</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Auto-run</span>
                        <span className={`text-sm font-medium ${autoRun ? "text-green-400" : "text-gray-400"}`}>
                          {autoRun ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      {executionTime > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Last Execution</span>
                          <span className="text-white font-medium">{executionTime.toFixed(2)}ms</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Language Grid */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Supported Languages</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(languageConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedLanguage(key as Language)}
                  className={`p-4 rounded-lg border transition-all duration-300 hover:scale-105 ${
                    selectedLanguage === key
                      ? "bg-white text-black border-white"
                      : "bg-gray-900 border-gray-700 hover:bg-gray-800 text-white"
                  }`}
                >
                  <div className="text-2xl mb-2">{config.icon}</div>
                  <div className="text-sm font-medium">{config.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

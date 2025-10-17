"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Camera,
  Send,
  ArrowLeft,
  Bot,
  Loader2,
  Sun,
  Moon,
  LogOut,
  Lightbulb,
  Shield,
  FileText,
  Sprout,
} from "lucide-react"
import Link from "next/link"

interface ChatMessage {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: string
}

const SUGGESTED_QUESTIONS = [
  "What are the best practices for cattle feeding?",
  "How can I apply for livestock insurance?",
  "What government schemes are available for farmers?",
  "How to prevent common diseases in buffalo?",
  "What are the vaccination schedules for livestock?",
  "How to improve milk production naturally?",
]

const FARMING_RESPONSES = {
  feeding: [
    "For optimal cattle feeding, provide 2-3% of body weight in dry matter daily. Include quality roughage like green fodder, hay, and concentrate feed. Ensure fresh water is always available.",
    "Buffalo feeding should include green fodder (30-40 kg), dry fodder (5-6 kg), and concentrate (3-4 kg) daily for a lactating animal. Adjust quantities based on milk production.",
  ],
  insurance: [
    "Livestock insurance schemes like Pashu Bima Yojana cover cattle and buffalo. Premium rates are subsidized by government. Contact your nearest veterinary officer or insurance agent for enrollment.",
    "The National Livestock Mission provides insurance coverage for indigenous breeds. You can get up to ₹40,000 coverage per animal with government subsidy on premiums.",
  ],
  schemes: [
    "Key government schemes include: National Livestock Mission, Rashtriya Gokul Mission, Dairy Entrepreneurship Development Scheme, and Animal Husbandry Infrastructure Development Fund.",
    "PM-KISAN scheme provides ₹6,000 annually to farmers. Additionally, Kisan Credit Card offers easy loans for livestock and farming activities at subsidized interest rates.",
  ],
  diseases: [
    "Common buffalo diseases include Foot and Mouth Disease, Hemorrhagic Septicemia, and Mastitis. Maintain proper hygiene, regular vaccination, and immediate veterinary consultation for symptoms.",
    "Prevention is key: Regular deworming, vaccination schedules, clean water, proper ventilation, and quarantine new animals. Keep veterinary contact numbers handy.",
  ],
  vaccination: [
    "Essential vaccinations: FMD (every 6 months), HS (annual), BQ (annual), and Brucellosis (as per vet advice). Maintain vaccination records and follow local veterinary guidelines.",
    "Vaccination schedule varies by region. Contact your local veterinary officer for area-specific vaccination calendar and government vaccination camps.",
  ],
  production: [
    "To improve milk production naturally: Provide balanced nutrition, ensure adequate water intake, maintain stress-free environment, regular milking schedule, and proper animal comfort.",
    "Green fodder like berseem, maize, and oats significantly boost milk production. Supplement with mineral mixtures and maintain optimal body condition score.",
  ],
}

export default function ChatPage() {
  const [user, setUser] = useState<any | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("agrilens_user")
    if (!userData) {
      router.push("/login")
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      if (!parsedUser.authenticated) {
        router.push("/login")
        return
      }
      setUser(parsedUser)
    } catch {
      router.push("/login")
    }

    // Load chat history
    const savedMessages = localStorage.getItem("agrilens_chat")
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages))
      } catch {
        setMessages([])
      }
    } else {
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        type: "bot",
        content:
          "Hello! I'm your AI farming assistant. I can help you with livestock management, government schemes, insurance, and farming best practices. How can I assist you today?",
        timestamp: new Date().toISOString(),
      }
      setMessages([welcomeMessage])
    }

    // Check for dark mode preference
    const isDark = localStorage.getItem("agrilens_theme") === "dark"
    setDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add("dark")
    }
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem("agrilens_theme", newDarkMode ? "dark" : "light")

    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("agrilens_user")
    router.push("/")
  }

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()

    if (message.includes("feed") || message.includes("nutrition") || message.includes("food")) {
      return FARMING_RESPONSES.feeding[Math.floor(Math.random() * FARMING_RESPONSES.feeding.length)]
    }
    if (message.includes("insurance") || message.includes("bima")) {
      return FARMING_RESPONSES.insurance[Math.floor(Math.random() * FARMING_RESPONSES.insurance.length)]
    }
    if (message.includes("scheme") || message.includes("government") || message.includes("yojana")) {
      return FARMING_RESPONSES.schemes[Math.floor(Math.random() * FARMING_RESPONSES.schemes.length)]
    }
    if (message.includes("disease") || message.includes("health") || message.includes("sick")) {
      return FARMING_RESPONSES.diseases[Math.floor(Math.random() * FARMING_RESPONSES.diseases.length)]
    }
    if (message.includes("vaccination") || message.includes("vaccine")) {
      return FARMING_RESPONSES.vaccination[Math.floor(Math.random() * FARMING_RESPONSES.vaccination.length)]
    }
    if (message.includes("milk") || message.includes("production") || message.includes("yield")) {
      return FARMING_RESPONSES.production[Math.floor(Math.random() * FARMING_RESPONSES.production.length)]
    }

    // Default responses
    const defaultResponses = [
      "That's a great question! For specific livestock management advice, I recommend consulting with your local veterinary officer. They can provide region-specific guidance.",
      "I'd be happy to help! Could you be more specific about what aspect of farming or livestock management you'd like to know about?",
      "For detailed information on government schemes and subsidies, you can visit your nearest Krishi Vigyan Kendra or contact the agriculture department.",
      "That's an important topic in modern farming. I suggest connecting with fellow farmers in your area or joining farmer producer organizations for practical insights.",
    ]

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInputMessage("")
    setIsTyping(true)

    // Simulate AI thinking time
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const botResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: "bot",
      content: generateBotResponse(messageText),
      timestamp: new Date().toISOString(),
    }

    const finalMessages = [...updatedMessages, botResponse]
    setMessages(finalMessages)
    setIsTyping(false)

    // Save to localStorage
    localStorage.setItem("agrilens_chat", JSON.stringify(finalMessages))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputMessage)
  }

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">AgriLens AI</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="w-9 h-9 p-0">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">AI Farming Assistant</h2>
              <p className="text-muted-foreground mb-6">
                Ask me anything about livestock management, farming, or schemes
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              {message.type === "bot" && (
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.type === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className="text-xs opacity-70 mt-2">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              {message.type === "user" && (
                <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  {/* User icon here */}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div className="p-4 border-t border-border">
            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Suggested Questions
            </h3>
            <div className="grid md:grid-cols-2 gap-2">
              {SUGGESTED_QUESTIONS.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestedQuestion(question)}
                  className="text-left justify-start h-auto p-3 text-wrap"
                >
                  <div className="flex items-start gap-2">
                    {question.includes("insurance") ? (
                      <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    ) : question.includes("scheme") ? (
                      <FileText className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    ) : (
                      <Sprout className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    )}
                    <span className="text-sm">{question}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="p-4 border-t border-border bg-card/50">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about farming, livestock, insurance, or government schemes..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button type="submit" disabled={!inputMessage.trim() || isTyping} className="px-6">
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI responses are for guidance only. Consult local experts for specific advice.
          </p>
        </div>
      </div>
    </div>
  )
}

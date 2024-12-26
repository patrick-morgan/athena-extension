import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/helpers";
import { useLocalStorage } from "@/utils/hooks";
import { Maximize2, MessageCircle, Minimize2, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { chatWithArticle } from "../api/api";

const FREE_MESSAGE_LIMIT = 5;
const STORAGE_KEY = "articleChats";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Record<string, string>;
}

interface ArticleChatProps {
  articleId: string;
  isPremium: boolean;
}

const WELCOME_OPTIONS = [
  {
    label: "Ask about article content",
    message: "Can you summarize the main points of this article?",
  },
  {
    label: "Understand bias scores",
    message:
      "Can you explain the political bias and objectivity scores for this article?",
  },
  {
    label: "Learn about the journalists",
    message:
      "What can you tell me about the journalists who wrote this article?",
  },
  {
    label: "Fact check & context",
    message: "Can you fact-check the main claims in this article?",
  },
  {
    label: "Compare perspectives",
    message:
      "How does this article's perspective compare to other coverage of this topic?",
  },
];

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Welcome! I can help you understand this article and its potential biases. Select an option below or ask your own question:",
};

const chatStyles = {
  message: {
    user: "bg-primary/90 text-primary-foreground",
    assistant: "bg-muted/50 border border-border/50",
    base: "rounded-2xl px-4 py-3 max-w-[85%] shadow-sm",
  },
  prose:
    "prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/50 prose-pre:rounded-md prose-headings:text-foreground prose-a:text-primary hover:prose-a:opacity-80",
};

export function ArticleChat({ articleId, isPremium }: ArticleChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Add this state
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [storedChats, setStoredChats] = useLocalStorage<
    Record<string, Message[]>
  >(STORAGE_KEY, {});

  // Load stored messages only once when component mounts or articleId changes
  useEffect(() => {
    const storedMessages = storedChats[articleId];
    if (storedMessages?.length) {
      setMessages(storedMessages);
    } else {
      setMessages([WELCOME_MESSAGE]);
    }
  }, [articleId, storedChats]); // Remove storedChats dependency

  // Save to localStorage only when a new message is added or chat is cleared
  const updateMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
    setStoredChats((prev) => ({
      ...prev,
      [articleId]: newMessages,
    }));
  };

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const canSendMessage = isPremium || userMessageCount < FREE_MESSAGE_LIMIT;

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading || !canSendMessage) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    // Add user message to chat
    const newMessages = [
      ...messages,
      { role: "user", content: userMessage } as Message,
    ];
    updateMessages(newMessages);

    try {
      const chatHistory = newMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await chatWithArticle(articleId, {
        message: userMessage,
        chatHistory,
      });

      if (response) {
        updateMessages([
          ...newMessages,
          {
            role: "assistant",
            content: response.response,
            sources: response.sources,
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      updateMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I encountered an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    updateMessages([WELCOME_MESSAGE]);
  };

  // Add ref for scroll container
  const scrollRef = useRef<HTMLDivElement>(null);

  // Add scroll to bottom helper
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Modify handleOptionClick to directly send the message
  const handleOptionClick = async (message: string) => {
    if (!canSendMessage || isLoading) return;

    setIsLoading(true);
    const newMessages = [
      ...messages,
      { role: "user", content: message } as Message,
    ];
    updateMessages(newMessages);

    try {
      const chatHistory = newMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await chatWithArticle(articleId, {
        message: message,
        chatHistory,
      });

      if (response) {
        updateMessages([
          ...newMessages,
          {
            role: "assistant",
            content: response.response,
            sources: response.sources,
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      updateMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I encountered an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
      // Scroll to bottom after message is sent
      setTimeout(scrollToBottom, 100);
    }
  };

  // Add useEffect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleExpand = () => {
    if (isExpanded) {
      document.documentElement.style.removeProperty("overflow");
    } else {
      document.documentElement.style.overflow = "hidden";
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "w-full rounded-md border bg-card text-card-foreground shadow-sm",
        isExpanded && "fixed inset-0 z-50 m-0 rounded-none border-none" // Add these classes when expanded
      )}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center">
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat with AI about this article
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {!isPremium && (
              <span>
                {Math.max(0, FREE_MESSAGE_LIMIT - userMessageCount)}/
                {FREE_MESSAGE_LIMIT} messages
              </span>
            )}
            <span>{isOpen ? "Click to minimize" : "Click to expand"}</span>
          </div>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <div className="border-t">
          <div
            className={cn(
              "flex flex-col relative",
              isExpanded ? "h-[calc(100vh-64px)]" : "h-[550px]"
            )}
          >
            {/* Add expand/minimize button next to trash */}
            <div className="absolute top-1 right-1 flex gap-1 z-10">
              <Button
                variant="secondary"
                size="icon"
                onClick={handleExpand}
                title={isExpanded ? "Minimize chat" : "Expand chat"}
                className="h-6 w-6 rounded-full bg-background shadow-sm hover:bg-muted/50"
              >
                {isExpanded ? (
                  <Minimize2 className="h-3 w-3" />
                ) : (
                  <Maximize2 className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={clearChat}
                title="Clear chat history"
                className="h-6 w-6 rounded-full bg-background shadow-sm hover:bg-muted/50"
              >
                <Trash className="h-3 w-3" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 mb-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {index === 0 && messages.length === 1 ? (
                      // Render welcome message with options
                      <div
                        className={cn(
                          chatStyles.message.base,
                          chatStyles.message.assistant
                        )}
                      >
                        <div className={chatStyles.prose}>
                          <p className="mb-3">{message.content}</p>
                          <div className="grid gap-2 max-w-[280px]">
                            {WELCOME_OPTIONS.map((option, idx) => (
                              <Button
                                key={idx}
                                variant="outline"
                                className="max-w-[280px] w-full justify-start text-left h-auto py-2 px-3 hover:bg-accent hover:text-accent-foreground transition-colors"
                                onClick={() =>
                                  handleOptionClick(option.message)
                                }
                                disabled={!canSendMessage}
                              >
                                <div className="w-full space-y-1">
                                  {" "}
                                  {/* Added space between label and message */}
                                  <div className="font-medium">
                                    {option.label}
                                  </div>
                                  <div className="text-xs text-muted-foreground break-words whitespace-normal leading-relaxed">
                                    {option.message}
                                  </div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Render regular messages
                      <div
                        className={cn(
                          chatStyles.message.base,
                          message.role === "user"
                            ? chatStyles.message.user
                            : chatStyles.message.assistant
                        )}
                      >
                        <div className={chatStyles.prose}>
                          <ReactMarkdown
                            components={{
                              a: ({ node, children, ...props }) => (
                                <a
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={
                                    typeof children === "string"
                                      ? children
                                      : "External link"
                                  }
                                  {...props}
                                >
                                  {children}
                                </a>
                              ),
                              code: ({ children, ...props }) => (
                                <code
                                  className="font-mono text-sm bg-muted/50 rounded px-1 py-0.5"
                                  {...props}
                                >
                                  {children}
                                </code>
                              ),
                              blockquote: ({ node, ...props }) => (
                                <blockquote
                                  className="border-l-2 border-primary/20 pl-4 italic"
                                  {...props}
                                />
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                        {message.sources &&
                          Object.keys(message.sources).length > 0 && (
                            <div className="mt-2 pt-2 border-t border-border/50">
                              <div className="text-xs font-medium text-muted-foreground">
                                Sources:
                              </div>
                              {Object.entries(message.sources).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="text-xs mt-1 text-muted-foreground"
                                  >
                                    <span className="font-medium">{key}:</span>{" "}
                                    {value}
                                  </div>
                                )
                              )}
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div
                      className={cn(
                        chatStyles.message.base,
                        chatStyles.message.assistant
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-.3s]" />
                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-.5s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  placeholder={
                    canSendMessage
                      ? "Ask a question about the article..."
                      : "Message limit reached - Upgrade to Premium"
                  }
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={!canSendMessage}
                  maxLength={500}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !canSendMessage}
                  size="icon"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { chatWithArticle } from "../api/api";
import { Alert, AlertDescription } from "./ui/alert";
import { useLocalStorage } from "@/utils/hooks";
import ReactMarkdown from "react-markdown";
import { cn } from "@/utils/helpers";
import { type Components } from "react-markdown";

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

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi! I'm here to help you understand this article better. Feel free to ask me any questions about the content, bias analysis, or the sources.",
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
  const [open, setOpen] = useState(false);
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

  return (
    <div className="w-full">
      <Button
        variant="outline"
        className="w-full hover:bg-muted/50 transition-colors"
        onClick={() => setOpen(true)}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Chat with AI about this article
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0 gap-0">
          <DialogHeader className="px-4 py-2 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle>Article Chat</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                title="Clear chat history"
                className="hover:bg-muted/50"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            {!isPremium && (
              <div className="text-xs text-muted-foreground mt-1">
                {Math.max(0, FREE_MESSAGE_LIMIT - userMessageCount)} of{" "}
                {FREE_MESSAGE_LIMIT} free messages remaining
                {" · "}
                <a href="/pricing" className="text-primary hover:underline">
                  Upgrade to Premium
                </a>
              </div>
            )}
          </DialogHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 mb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
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
        </DialogContent>
      </Dialog>
    </div>
  );
}

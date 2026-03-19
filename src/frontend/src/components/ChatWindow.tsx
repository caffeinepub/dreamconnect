import { Button } from "@/components/ui/button";
import {
  useChatMessages,
  useProviderChatMessages,
  useSendChatMessage,
  useSendChatMessageAsProvider,
} from "@/hooks/useQueries";
import { Loader2, MessageCircle, Mic, Minus, Send, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const VOICE_PREFIX = "[VOICE_MSG]";
const MAX_RECORD_SECONDS = 60;

function isVoiceMsg(content: string) {
  return content.startsWith(VOICE_PREFIX);
}

function VoicePlayer({ content }: { content: string }) {
  const base64 = content.slice(VOICE_PREFIX.length);
  const blobUrlRef = useRef<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "audio/webm" });
    const url = URL.createObjectURL(blob);
    blobUrlRef.current = url;
    setBlobUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [base64]);

  if (!blobUrl) return null;
  return (
    <div className="flex flex-col gap-0.5">
      {/* biome-ignore lint/a11y/useMediaCaption: voice message audio, captions not applicable */}
      <audio controls src={blobUrl} className="h-8 max-w-[200px]" />
      <span className="text-[10px] opacity-60">🎤 Voice</span>
    </div>
  );
}

function useVoiceRecorder(onSend: (content: string) => Promise<void>) {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/ogg";
      const mr = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        for (const t of stream.getTracks()) {
          t.stop();
        }
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        if (elapsed < 1) {
          toast("Hold longer to record a message");
          return;
        }
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          const base64 = dataUrl.split(",")[1];
          await onSend(`${VOICE_PREFIX}${base64}`);
        };
        reader.readAsDataURL(blob);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      startTimeRef.current = Date.now();
      setRecording(true);
      // auto-stop after MAX_RECORD_SECONDS
      autoStopRef.current = setTimeout(
        () => stopRecording(),
        MAX_RECORD_SECONDS * 1000,
      );
    } catch {
      toast.error("Microphone permission denied");
    }
  };

  const stopRecording = () => {
    if (autoStopRef.current) clearTimeout(autoStopRef.current);
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  return { recording, startRecording, stopRecording };
}

interface CustomerChatWindowProps {
  category: string;
  product: string;
  serviceProviderId: string;
  providerName: string;
  businessName: string;
  onClose: () => void;
  index: number;
}

export function CustomerChatWindow({
  category,
  product,
  serviceProviderId,
  providerName,
  businessName,
  onClose,
  index,
}: CustomerChatWindowProps) {
  const [text, setText] = useState("");
  const [minimized, setMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: messages = [], isLoading } = useChatMessages(
    category,
    product,
    serviceProviderId,
  );
  const send = useSendChatMessage();

  const handleSendText = async (content: string) => {
    if (!content) return;
    setText("");
    try {
      await send.mutateAsync({ category, product, serviceProviderId, content });
    } catch {
      toast.error("Failed to send message");
      setText(content);
    }
  };

  const handleSendVoice = async (content: string) => {
    try {
      await send.mutateAsync({ category, product, serviceProviderId, content });
    } catch {
      toast.error("Failed to send voice message");
    }
  };

  const { recording, startRecording, stopRecording } =
    useVoiceRecorder(handleSendVoice);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content) return;
    await handleSendText(content);
  };

  const right = 16 + index * 320;

  return (
    <motion.div
      data-ocid={`chat.panel.${index}`}
      className="fixed bottom-0 z-50 w-80 rounded-t-2xl border border-border shadow-2xl bg-card flex flex-col overflow-hidden"
      style={{ right: `${right}px` }}
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      {/* Header */}
      <button
        type="button"
        className="flex items-center justify-between px-4 py-3 bg-primary text-white flex-shrink-0 w-full"
        onClick={() => setMinimized((v) => !v)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <MessageCircle size={14} />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-sm font-bold leading-none truncate">
              {providerName}
            </p>
            <p className="text-xs opacity-75 truncate mt-0.5">{businessName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            data-ocid={`chat.close_button.${index}`}
            onClick={(e) => {
              e.stopPropagation();
              setMinimized((v) => !v);
            }}
            className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <Minus size={12} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      </button>

      {!minimized && (
        <>
          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 space-y-2 bg-background/60"
            style={{ maxHeight: "320px", minHeight: "200px" }}
          >
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2
                  size={20}
                  className="animate-spin text-muted-foreground"
                />
              </div>
            ) : messages.length === 0 ? (
              <div
                data-ocid={`chat.empty_state.${index}`}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <MessageCircle
                  size={24}
                  className="text-muted-foreground mb-2"
                />
                <p className="text-xs text-muted-foreground">
                  No messages yet.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Send your first message below!
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={String(msg.id)}
                  className={`flex ${
                    msg.senderIsProvider ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-snug ${
                      msg.senderIsProvider
                        ? "bg-muted text-foreground rounded-tl-sm"
                        : "bg-primary text-white rounded-tr-sm"
                    }`}
                  >
                    {isVoiceMsg(msg.content) ? (
                      <VoicePlayer content={msg.content} />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-t border-border bg-card">
            {recording ? (
              <div className="flex-1 flex items-center gap-2 bg-red-500/10 border border-red-400/30 rounded-xl px-3 py-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                <span className="text-xs text-red-600 font-medium">
                  Recording...
                </span>
              </div>
            ) : (
              <input
                data-ocid={`chat.input.${index}`}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 bg-muted border border-border rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
              />
            )}
            {/* Mic button */}
            <button
              type="button"
              data-ocid={`chat.upload_button.${index}`}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              title="Hold to record voice message"
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                recording
                  ? "bg-red-500 text-white"
                  : "bg-muted border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <Mic size={14} />
            </button>
            {!recording && (
              <Button
                data-ocid={`chat.submit_button.${index}`}
                size="icon"
                onClick={handleSend}
                disabled={!text.trim() || send.isPending}
                className="w-8 h-8 rounded-xl bg-primary hover:opacity-90 flex-shrink-0"
              >
                {send.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </Button>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

// ===== PROVIDER CHAT WINDOW =====

interface ProviderChatWindowProps {
  category: string;
  product: string;
  memberId: string;
  memberName: string;
  onClose: () => void;
  index: number;
}

export function ProviderChatWindow({
  category,
  product,
  memberId,
  memberName,
  onClose,
  index,
}: ProviderChatWindowProps) {
  const [text, setText] = useState("");
  const [minimized, setMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: messages = [], isLoading } = useProviderChatMessages(
    category,
    product,
    memberId,
  );
  const send = useSendChatMessageAsProvider();

  const handleSendText = async (content: string) => {
    if (!content) return;
    setText("");
    try {
      await send.mutateAsync({ category, product, memberId, content });
    } catch {
      toast.error("Failed to send message");
      setText(content);
    }
  };

  const handleSendVoice = async (content: string) => {
    try {
      await send.mutateAsync({ category, product, memberId, content });
    } catch {
      toast.error("Failed to send voice message");
    }
  };

  const { recording, startRecording, stopRecording } =
    useVoiceRecorder(handleSendVoice);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content) return;
    await handleSendText(content);
  };

  const right = 16 + index * 320;

  return (
    <motion.div
      data-ocid={`provider_chat.panel.${index}`}
      className="fixed bottom-0 z-50 w-80 rounded-t-2xl border border-border shadow-2xl bg-card flex flex-col overflow-hidden"
      style={{ right: `${right}px` }}
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      {/* Header */}
      <button
        type="button"
        className="flex items-center justify-between px-4 py-3 bg-accent text-accent-foreground flex-shrink-0 w-full"
        onClick={() => setMinimized((v) => !v)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
            <MessageCircle size={14} />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold leading-none">{memberName}</p>
            <p className="text-xs opacity-70 mt-0.5">Customer</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMinimized((v) => !v);
            }}
            className="w-6 h-6 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
          >
            <Minus size={12} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-6 h-6 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      </button>

      {!minimized && (
        <>
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 space-y-2 bg-background/60"
            style={{ maxHeight: "320px", minHeight: "200px" }}
          >
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2
                  size={20}
                  className="animate-spin text-muted-foreground"
                />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <MessageCircle
                  size={24}
                  className="text-muted-foreground mb-2"
                />
                <p className="text-xs text-muted-foreground">
                  No messages yet.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={String(msg.id)}
                  className={`flex ${
                    msg.senderIsProvider ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-snug ${
                      msg.senderIsProvider
                        ? "bg-accent text-accent-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}
                  >
                    {isVoiceMsg(msg.content) ? (
                      <VoicePlayer content={msg.content} />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center gap-2 px-3 py-2.5 border-t border-border bg-card">
            {recording ? (
              <div className="flex-1 flex items-center gap-2 bg-red-500/10 border border-red-400/30 rounded-xl px-3 py-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                <span className="text-xs text-red-600 font-medium">
                  Recording...
                </span>
              </div>
            ) : (
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Reply to customer..."
                className="flex-1 bg-muted border border-border rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
              />
            )}
            {/* Mic button */}
            <button
              type="button"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              title="Hold to record voice message"
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                recording
                  ? "bg-red-500 text-white"
                  : "bg-muted border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <Mic size={14} />
            </button>
            {!recording && (
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!text.trim() || send.isPending}
                className="w-8 h-8 rounded-xl bg-accent hover:opacity-90 flex-shrink-0"
              >
                {send.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </Button>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

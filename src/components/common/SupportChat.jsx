import { MessageCircle, X, Send, User } from 'lucide-react';
import { useState } from 'react';

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Xin chào! Chúng tôi có thể giúp gì cho bạn?' },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now(), type: 'user', text: inputText };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Mock bot reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'bot',
          text: 'Cảm ơn bạn đã quan tâm. Nhân viên tư vấn sẽ liên hệ lại với bạn trong giây lát!',
        },
      ]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-[#d90f0f] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform group"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute right-full mr-3 bg-white text-[#222] px-3 py-1.5 rounded-xl text-sm font-medium shadow-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
            Chat với chúng tôi
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-[350px] h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-[#d90f0f] p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm">CClearly Support</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-[10px] text-white/80 uppercase font-bold tracking-wider">
                    Trực tuyến
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.type === 'user'
                      ? 'bg-[#d90f0f] text-white rounded-tr-none'
                      : 'bg-white text-[#4f5562] shadow-sm border border-gray-100 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="p-4 bg-white border-t flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-[#f3f3f3] border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-[#d90f0f] outline-none"
            />
            <button
              type="submit"
              className="bg-[#d90f0f] text-white p-2 rounded-full hover:bg-[#0d4fb8] transition active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SupportChat;


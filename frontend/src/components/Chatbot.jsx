import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../api';
import { Send, Loader2, Bot, User, BookOpen } from 'lucide-react';

export default function Chatbot() {
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hello, I am Swasthya-Setu. How can I help you today? / नमस्ते, मैं स्वास्थ्य-सेतु हूँ। मैं आज आपकी कैसे मदद कर सकता हूँ?', language: 'en' }
    ]);
    const [input, setInput] = useState('');
    const [language, setLanguage] = useState('en');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);

    const endOfMessagesRef = useRef(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage, language }]);
        setLoading(true);

        try {
            const data = await sendChatMessage(userMessage, language, sessionId);
            if (!sessionId) setSessionId(data.session_id);

            setMessages(prev => [...prev, {
                role: 'bot',
                text: data.response,
                language,
                sources: data.sources
            }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I am having trouble connecting to the health database right now.', isError: true }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <Bot className="w-6 h-6 text-blue-600" />
                    <h2 className="text-lg font-bold text-gray-800">Swasthya-Setu RAG Assistant</h2>
                </div>
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="p-2 text-sm border border-gray-200 rounded-lg outline-none bg-white"
                >
                    <option value="en">English</option>
                    <option value="hi">हिंदी</option>
                </select>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : msg.isError
                                    ? 'bg-red-50 border border-red-100 text-red-800 rounded-tl-none'
                                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                            }`}>
                            <div className="flex items-start gap-3">
                                {msg.role === 'bot' && <Bot className="w-5 h-5 mt-1 opacity-70" />}
                                <div className="flex-1">
                                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                                                <BookOpen className="w-3 h-3" /> Sources
                                            </div>
                                            <ul className="space-y-1">
                                                {msg.sources.map((src, i) => (
                                                    <li key={i} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mr-2 mb-1">
                                                        {src}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex gap-2 items-center text-gray-400">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> Thinking...
                        </div>
                    </div>
                )}
                <div ref={endOfMessagesRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-100 rounded-b-2xl">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={language === 'en' ? 'Ask a medical question...' : 'चिकित्सकीय सवाल पूछें...'}
                        className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-6 h-6" />
                    </button>
                </form>
            </div>
        </div>
    );
}

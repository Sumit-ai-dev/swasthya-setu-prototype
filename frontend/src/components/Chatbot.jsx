import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendChatMessage } from '../api';
import { Send, Loader2, Bot, User, BookOpen, Sparkles } from 'lucide-react';

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
        <div className="max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl shadow-2xl flex flex-col h-[700px] border border-white/10"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-t-3xl">
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg"
                        >
                            <Sparkles className="w-6 h-6" />
                        </motion.div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                Medical AI Assistant
                            </h2>
                            <p className="text-sm text-gray-400">Powered by RAG Technology</p>
                        </div>
                    </div>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="p-3 text-sm glass rounded-xl outline-none font-medium text-white bg-white/5"
                    >
                        <option value="en" className="bg-slate-800">English</option>
                        <option value="hi" className="bg-slate-800">हिंदी</option>
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/50">
                    <AnimatePresence>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: "spring", duration: 0.5 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className={`max-w-[85%] rounded-2xl p-5 shadow-lg ${
                                        msg.role === 'user'
                                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none'
                                            : msg.isError
                                            ? 'glass border-2 border-red-500/50 text-red-300 rounded-tl-none'
                                            : 'glass rounded-tl-none text-white border border-white/10'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {msg.role === 'bot' && (
                                            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg text-white">
                                                <Bot className="w-5 h-5" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                                            {msg.sources && msg.sources.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    transition={{ delay: 0.3 }}
                                                    className="mt-4 pt-4 border-t border-white/10"
                                                >
                                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">
                                                        <BookOpen className="w-4 h-4" /> Medical Sources
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {msg.sources.map((src, i) => (
                                                            <motion.span
                                                                key={i}
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: 0.4 + i * 0.1 }}
                                                                className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1.5 rounded-full font-medium shadow-md"
                                                            >
                                                                {src}
                                                            </motion.span>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="glass rounded-2xl rounded-tl-none p-5 shadow-lg flex gap-3 items-center border border-white/10">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg text-white"
                                >
                                    <Sparkles className="w-5 h-5" />
                                </motion.div>
                                <div className="flex items-center gap-2 text-gray-300 font-medium">
                                    <motion.span
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        Thinking
                                    </motion.span>
                                    <motion.span
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                                    >
                                        .
                                    </motion.span>
                                    <motion.span
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                                    >
                                        .
                                    </motion.span>
                                    <motion.span
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                                    >
                                        .
                                    </motion.span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={endOfMessagesRef} />
                </div>

                <div className="p-6 border-t border-white/10 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-b-3xl">
                    <form onSubmit={handleSend} className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={language === 'en' ? 'Ask a medical question...' : 'चिकित्सकीय सवाल पूछें...'}
                            className="flex-1 p-4 glass rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder-gray-500 bg-white/5"
                            disabled={loading}
                        />
                        <motion.button
                            type="submit"
                            disabled={!input.trim() || loading}
                            whileHover={{ scale: !input.trim() || loading ? 1 : 1.05 }}
                            whileTap={{ scale: !input.trim() || loading ? 1 : 0.95 }}
                            className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Send className="w-6 h-6" />
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

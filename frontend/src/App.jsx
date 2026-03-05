import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Triage from './components/Triage';
import Chatbot from './components/Chatbot';
import Analytics from './components/Analytics';
import Hero from './components/Hero';
import { ActivitySquare, MessageSquare, BarChart3, Sparkles } from 'lucide-react';

function App() {
    const [activeTab, setActiveTab] = useState('home');

    console.log('App rendering, activeTab:', activeTab);

    return (
        <div className="min-h-screen flex flex-col bg-slate-900">
            {/* Premium Header */}
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <motion.div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => setActiveTab('home')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-lg opacity-50" />
                                <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-xl">
                                    <Sparkles className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">
                                    Swasthya-Setu
                                </h1>
                                <p className="text-xs text-gray-400">स्वास्थ्य-सेतु</p>
                            </div>
                        </motion.div>

                        {/* Navigation */}
                        <nav className="flex items-center gap-2">
                            {[
                                { id: 'triage', icon: ActivitySquare, label: 'Triage' },
                                { id: 'chatbot', icon: MessageSquare, label: 'AI Chat' },
                                { id: 'analytics', icon: BarChart3, label: 'Analytics' }
                            ].map((tab) => (
                                <motion.button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
                                        activeTab === tab.id
                                            ? 'text-white'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <tab.icon className="w-4 h-4 relative z-10" />
                                    <span className="hidden sm:inline relative z-10">{tab.label}</span>
                                </motion.button>
                            ))}
                        </nav>
                    </div>
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="flex-1 pt-20">
                <AnimatePresence mode="wait">
                    {activeTab === 'home' && (
                        <motion.div
                            key="home"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Hero onGetStarted={() => setActiveTab('triage')} />
                            
                            {/* Quick Access Section */}
                            <div className="relative py-20 px-4">
                                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />
                                <div className="relative max-w-7xl mx-auto">
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-center mb-16"
                                    >
                                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                            Choose Your Service
                                        </h2>
                                        <p className="text-gray-400 text-lg">
                                            Access enterprise-grade healthcare AI tools
                                        </p>
                                    </motion.div>
                                    
                                    <div className="grid md:grid-cols-3 gap-8">
                                        {[
                                            { 
                                                id: 'triage', 
                                                icon: ActivitySquare, 
                                                title: 'AI Triage System', 
                                                desc: 'Intelligent symptom analysis with ML-powered priority classification',
                                                gradient: 'from-blue-600 to-cyan-600'
                                            },
                                            { 
                                                id: 'chatbot', 
                                                icon: MessageSquare, 
                                                title: 'Medical AI Assistant', 
                                                desc: 'RAG-powered conversational AI with vector search capabilities',
                                                gradient: 'from-indigo-600 to-purple-600'
                                            },
                                            { 
                                                id: 'analytics', 
                                                icon: BarChart3, 
                                                title: 'Platform Analytics', 
                                                desc: 'Real-time insights and performance metrics dashboard',
                                                gradient: 'from-purple-600 to-pink-600'
                                            }
                                        ].map((card, idx) => (
                                            <motion.div
                                                key={card.id}
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 + idx * 0.1 }}
                                                whileHover={{ y: -12, scale: 1.02 }}
                                                onClick={() => setActiveTab(card.id)}
                                                className="group relative glass p-8 rounded-3xl cursor-pointer border border-white/10 hover:border-white/20 transition-all duration-300"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300" 
                                                     style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
                                                
                                                <div className={`w-16 h-16 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                                                    <card.icon className="w-8 h-8 text-white" />
                                                </div>
                                                
                                                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                                                    {card.title}
                                                </h3>
                                                <p className="text-gray-400 leading-relaxed">
                                                    {card.desc}
                                                </p>
                                                
                                                <div className="mt-6 flex items-center text-blue-400 font-semibold group-hover:gap-3 gap-2 transition-all">
                                                    <span>Launch</span>
                                                    <motion.span
                                                        className="group-hover:translate-x-1 transition-transform"
                                                    >
                                                        →
                                                    </motion.span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    
                    {activeTab === 'triage' && (
                        <motion.div
                            key="triage"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4 }}
                            className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4"
                        >
                            <Triage />
                        </motion.div>
                    )}
                    
                    {activeTab === 'chatbot' && (
                        <motion.div
                            key="chatbot"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4 }}
                            className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4"
                        >
                            <Chatbot />
                        </motion.div>
                    )}
                    
                    {activeTab === 'analytics' && (
                        <motion.div
                            key="analytics"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4 }}
                            className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4"
                        >
                            <Analytics />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Premium Footer */}
            <footer className="relative glass border-t border-white/10 py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-400 font-medium">
                        Built for the <span className="text-blue-400 font-semibold">AI For Bharat Hackathon</span> 🇮🇳
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Enterprise-grade healthcare AI • Not a replacement for professional medical advice
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default App;

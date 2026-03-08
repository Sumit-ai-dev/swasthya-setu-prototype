import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, ArrowRight, CheckCircle2, Brain } from 'lucide-react';

export default function Hero({ onGetStarted }) {
    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Lightweight animated background */}
            <div className="absolute inset-0 bg-slate-900">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Gradient Overlay - lighter to see 3D */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-indigo-950/70 to-slate-900/80 z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.15),transparent_50%)]" />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] z-10" />

            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
                <div className="grid lg:grid-cols-1 gap-12 items-center">
                    {/* Center Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-white space-y-8 text-center max-w-4xl mx-auto"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mx-auto"
                        >
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-sm font-medium text-gray-300">AI for Bharat Hackathon 2026 🇮🇳</span>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-4">
                                <span className="bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
                                    Healthcare AI
                                </span>
                                <br />
                                <span className="text-white">for Bharat</span>
                            </h1>
                            <p className="text-xl text-gray-400 font-light">स्वास्थ्य-सेतु</p>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-xl text-gray-300 leading-relaxed"
                        >
                            Enterprise-grade AI triage and medical guidance system.
                            Leveraging RAG architecture for accurate, context-aware health insights in multiple languages.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex justify-center"
                        >
                            <button
                                onClick={onGetStarted}
                                className="group px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-bold text-xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center gap-3 hover:scale-105 active:scale-95"
                            >
                                Get Started
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10 max-w-2xl mx-auto"
                        >
                            {[
                                { icon: Activity, label: 'Triage Levels', value: 'RED·YLW·GRN' },
                                { icon: Brain, label: 'Languages', value: 'Hindi & EN' },
                                { icon: Shield, label: 'Guidelines', value: 'WHO / NHM' }
                            ].map((stat, idx) => (
                                <div key={idx} className="space-y-2">
                                    <stat.icon className="w-6 h-6 text-blue-400 mx-auto" />
                                    <p className="text-xl font-bold">{stat.value}</p>
                                    <p className="text-sm text-gray-400">{stat.label}</p>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>

                {/* Feature Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="grid md:grid-cols-3 gap-6 mt-20"
                >
                    {[
                        {
                            icon: Activity,
                            title: 'Intelligent Triage',
                            desc: 'ML-powered symptom analysis with confidence scoring',
                            features: ['Multi-language support', 'Priority classification', 'Real-time analysis']
                        },
                        {
                            icon: Brain,
                            title: 'RAG-Based Chat',
                            desc: 'Context-aware medical guidance using vector embeddings',
                            features: ['Source attribution', 'Semantic search', 'Session memory']
                        },
                        {
                            icon: Shield,
                            title: 'Enterprise Security',
                            desc: 'HIPAA-compliant architecture with data encryption',
                            features: ['End-to-end encryption', 'Audit logging', 'Access control']
                        }
                    ].map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 + idx * 0.1 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="group glass p-8 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all duration-300"
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <feature.icon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-gray-400 mb-6">{feature.desc}</p>
                            <ul className="space-y-2">
                                {feature.features.map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
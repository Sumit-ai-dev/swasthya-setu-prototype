import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnalyticsSummary } from '../api';
import { Activity, Users, AlertTriangle, TrendingUp, HeartPulse, RefreshCw } from 'lucide-react';

export default function Analytics() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = useCallback(async (manual = false) => {
        if (manual) setRefreshing(true);
        try {
            const data = await getAnalyticsSummary();
            setStats(data);
            setLastUpdated(new Date());
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        // Auto-refresh every 10 seconds
        const interval = setInterval(() => fetchStats(), 10000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    if (loading || !stats) {
        return (
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-20 rounded-3xl shadow-2xl border border-white/10 flex justify-center items-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
                    />
                </motion.div>
            </div>
        );
    }

    const { triage_distribution } = stats;
    const total = stats.total_consultations || 1;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start justify-between"
            >
                <div>
                    <h2 className="text-4xl font-bold text-white mb-2">Platform Analytics</h2>
                    <p className="text-gray-400 text-lg">Real-time insights and performance metrics</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Live pulse indicator */}
                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs text-green-400 font-semibold">LIVE</span>
                    </div>
                    {/* Manual refresh button */}
                    <button
                        onClick={() => fetchStats(true)}
                        className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all"
                        title="Refresh now"
                    >
                        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </motion.div>

            {lastUpdated && (
                <p className="text-xs text-gray-500 -mt-4">
                    Last updated: {lastUpdated.toLocaleTimeString()} · auto-refreshes every 10s
                </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { icon: Activity, label: 'Total Consultations', value: stats.total_consultations, color: 'from-blue-500 to-blue-600', delay: 0.1 },
                    { icon: Users, label: 'Daily Active Users', value: stats.daily_active_users, color: 'from-indigo-500 to-indigo-600', delay: 0.2 },
                    { icon: HeartPulse, label: 'Pregnant Patients', value: stats.pregnant_patients_count || 0, color: 'from-pink-500 to-rose-600', delay: 0.3 }
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: stat.delay }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="glass p-6 rounded-3xl shadow-xl border border-white/10"
                    >
                        <div className="flex items-center gap-4">
                            <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                                className={`p-4 bg-gradient-to-br ${stat.color} text-white rounded-2xl shadow-lg`}
                            >
                                <stat.icon className="w-8 h-8" />
                            </motion.div>
                            <div>
                                <p className="text-sm font-semibold text-gray-400 mb-1">{stat.label}</p>
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={stat.value}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="text-4xl font-bold text-white"
                                    >
                                        {stat.value}
                                    </motion.p>
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass p-8 rounded-3xl shadow-xl border border-white/10"
            >
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        Triage Distribution
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-green-400">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <TrendingUp className="w-4 h-4" />
                        <span>Live Data</span>
                    </div>
                </div>

                <div className="space-y-6">
                    {[
                        { level: 'GREEN', count: triage_distribution.GREEN, color: 'from-green-500 to-emerald-600' },
                        { level: 'YELLOW', count: triage_distribution.YELLOW, color: 'from-yellow-400 to-orange-500' },
                        { level: 'RED', count: triage_distribution.RED, color: 'from-red-500 to-red-600' }
                    ].map((item) => {
                        const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
                        return (
                            <div key={item.level} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-300 text-lg">{item.level}</span>
                                    <span className="text-2xl font-bold text-white">{item.count}</span>
                                </div>
                                <div className="relative h-8 bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/10">
                                    <motion.div
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className={`h-full bg-gradient-to-r ${item.color} rounded-full shadow-lg flex items-center justify-end pr-4`}
                                    >
                                        {pct > 0 && (
                                            <span className="text-white font-bold text-sm">{pct}%</span>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}

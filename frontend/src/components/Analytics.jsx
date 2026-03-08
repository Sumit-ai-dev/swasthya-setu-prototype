import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAnalyticsSummary } from '../api';
import { Activity, Users, Clock, AlertTriangle, TrendingUp, HeartPulse } from 'lucide-react';

export default function Analytics() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAnalyticsSummary().then(data => {
            setStats(data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

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

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 className="text-4xl font-bold text-white mb-2">
                    Platform Analytics
                </h2>
                <p className="text-gray-400 text-lg">Real-time insights and performance metrics</p>
            </motion.div>

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
                                <motion.p
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: stat.delay + 0.2, type: "spring" }}
                                    className="text-4xl font-bold text-white"
                                >
                                    {stat.value}
                                </motion.p>
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
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <TrendingUp className="w-4 h-4" />
                        <span>Live Data</span>
                    </div>
                </div>

                <div className="space-y-6">
                    {[
                        { level: 'GREEN', count: triage_distribution.GREEN, color: 'from-green-500 to-emerald-600', delay: 0.5 },
                        { level: 'YELLOW', count: triage_distribution.YELLOW, color: 'from-yellow-400 to-orange-500', delay: 0.6 },
                        { level: 'RED', count: triage_distribution.RED, color: 'from-red-500 to-red-600', delay: 0.7 }
                    ].map((item) => (
                        <motion.div
                            key={item.level}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: item.delay }}
                            className="space-y-2"
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-300 text-lg">{item.level}</span>
                                <span className="text-2xl font-bold text-white">{item.count}</span>
                            </div>
                            <div className="relative h-8 bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/10">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(item.count / stats.total_consultations) * 100}%` }}
                                    transition={{ delay: item.delay + 0.2, duration: 1, ease: "easeOut" }}
                                    className={`h-full bg-gradient-to-r ${item.color} rounded-full shadow-lg flex items-center justify-end pr-4`}
                                >
                                    <span className="text-white font-bold text-sm">
                                        {((item.count / stats.total_consultations) * 100).toFixed(1)}%
                                    </span>
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

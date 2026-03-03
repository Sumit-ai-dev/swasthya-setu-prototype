import React, { useEffect, useState } from 'react';
import { getAnalyticsSummary } from '../api';
import { Activity, Users, Clock, AlertTriangle } from 'lucide-react';

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
            <div className="flex justify-center p-12">
                <div className="animate-pulse flex gap-2 items-center text-gray-500 font-medium">
                    Loading dashboard metrics...
                </div>
            </div>
        );
    }

    const { triage_distribution } = stats;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 px-2">Platform Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Activity className="w-8 h-8" /></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Consultations</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.total_consultations}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl"><Users className="w-8 h-8" /></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Daily Active Users</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.daily_active_users}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><Clock className="w-8 h-8" /></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.avg_response_time}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-gray-400" /> Triage Distribution
                    </h3>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 bg-gray-100 h-6 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{ width: `${(triage_distribution.GREEN / stats.total_consultations) * 100}%` }}></div>
                        </div>
                        <div className="w-24 text-right">
                            <span className="font-bold text-gray-700">{triage_distribution.GREEN}</span> <span className="text-sm text-gray-500">GREEN</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex-1 bg-gray-100 h-6 rounded-full overflow-hidden">
                            <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${(triage_distribution.YELLOW / stats.total_consultations) * 100}%` }}></div>
                        </div>
                        <div className="w-24 text-right">
                            <span className="font-bold text-gray-700">{triage_distribution.YELLOW}</span> <span className="text-sm text-gray-500">YELLOW</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex-1 bg-gray-100 h-6 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full rounded-full" style={{ width: `${(triage_distribution.RED / stats.total_consultations) * 100}%` }}></div>
                        </div>
                        <div className="w-24 text-right">
                            <span className="font-bold text-gray-700">{triage_distribution.RED}</span> <span className="text-sm text-gray-500">RED</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

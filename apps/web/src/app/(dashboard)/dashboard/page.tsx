import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Eye, MapPin, RefreshCw, Car, Users, Building, Activity, Clock, FileText } from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="space-y-4">
            {/* Top row metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="rounded-xl shadow-sm border-gray-100 relative overflow-hidden">
                    <CardContent className="p-4 flex flex-col items-center justify-center min-h-[110px]">
                        <div className="absolute top-3 left-3 text-gray-400">
                            <FileText size={14} />
                        </div>
                        <div className="absolute top-2 right-2 text-[10px] text-gray-400 font-medium space-x-1">
                            <span className="text-emerald-500">total: 2,382</span>
                            <span>Old: 1,157</span>
                        </div>
                        <div className="text-3xl font-bold text-brand mt-4">1,215</div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Bookings</p>
                    </CardContent>
                </Card>

                <Card className="rounded-xl shadow-sm border-gray-100 relative overflow-hidden">
                    <CardContent className="p-4 flex flex-col items-center justify-center min-h-[110px]">
                        <div className="absolute top-3 left-3 text-gray-400">
                            <Car size={14} />
                        </div>
                        <div className="text-3xl font-bold text-brand mt-4">1</div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Active Bookings</p>
                    </CardContent>
                </Card>

                <Card className="rounded-xl shadow-sm border-gray-100 relative overflow-hidden">
                    <CardContent className="p-4 flex flex-col items-center justify-center min-h-[110px]">
                        <div className="absolute top-3 left-3 text-gray-400">
                            <Users size={14} />
                        </div>
                        <div className="text-3xl font-bold text-brand mt-4">73</div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Personnels</p>
                    </CardContent>
                </Card>

                <Card className="rounded-xl shadow-sm border-gray-100 relative overflow-hidden">
                    <CardContent className="p-4 flex flex-col items-center justify-center min-h-[110px]">
                        <div className="absolute top-3 left-3 text-gray-400">
                            <MapPin size={14} />
                        </div>
                        <div className="text-3xl font-bold text-brand mt-4">9</div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Stations</p>
                    </CardContent>
                </Card>

                <Card className="rounded-xl shadow-sm border-gray-100 relative overflow-hidden">
                    <CardContent className="p-4 flex flex-col items-center justify-center min-h-[110px]">
                        <div className="absolute top-3 left-3 text-gray-400">
                            <Activity size={14} />
                        </div>
                        <div className="text-3xl font-bold text-brand mt-4">42</div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Ambulances</p>
                    </CardContent>
                </Card>
            </div>

            {/* Second row metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="rounded-xl shadow-sm border-gray-100 relative overflow-hidden">
                    <CardContent className="p-4 flex flex-col items-center justify-center min-h-[110px]">
                        <div className="absolute top-3 left-3 text-gray-400">
                            <Clock size={14} />
                        </div>
                        <div className="text-3xl font-bold text-brand mt-4">1</div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Shifts</p>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2 rounded-xl shadow-sm border-gray-100 relative overflow-hidden">
                    <CardContent className="p-4 flex flex-col items-center justify-center min-h-[110px]">
                        <div className="absolute top-3 left-3 text-gray-400">
                            <Clock size={14} />
                        </div>
                        <div className="text-3xl font-bold text-brand mt-4">0.0</div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Total Response Time</p>
                    </CardContent>
                </Card>
            </div>

            {/* Third Row: Map and Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Map Card */}
                <Card className="rounded-xl shadow-sm border-gray-100 overflow-hidden flex flex-col h-[500px]">
                    <CardHeader className="py-3 px-4 border-b border-gray-100 flex flex-row items-center justify-between bg-white shrink-0">
                        <div className="flex items-center gap-2">
                            <MapPin className="text-brand w-4 h-4" />
                            <CardTitle className="text-sm font-bold text-gray-800">Trip Density Map</CardTitle>
                        </div>
                        <div className="border border-brand text-brand px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase">
                            Live
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 relative bg-slate-900 border-none">
                        {/* Placeholder for the map */}
                        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center p-4 text-center">
                            <div className="text-slate-500 text-sm">
                                Map Integration goes here (Leaflet/Mapbox).<br />
                                The visual shows a dark map with red overlay dots.
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Shifts Table */}
                <Card className="rounded-xl shadow-sm border-gray-100 flex flex-col h-[500px]">
                    <CardHeader className="py-4 px-6 border-b border-gray-100 flex flex-row items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <Activity className="text-emerald-500 w-5 h-5" />
                            <CardTitle className="text-base font-bold text-gray-800">Active Shifts</CardTitle>
                            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
                                1 Active
                            </span>
                        </div>
                        <button className="text-emerald-500 text-[10px] font-bold tracking-widest uppercase hover:underline">
                            View All &rarr;
                        </button>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">#</th>
                                    <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shift Name</th>
                                    <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Provider</th>
                                    <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Days</th>
                                    <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                            1
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="text-sm font-semibold text-gray-800">Addis Ababa Fire And...</p>
                                        <p className="text-xs text-gray-400">Time not set</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                                                <Building className="w-3 h-3 text-gray-400" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-600">Addis Ababa Fire And...</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex gap-1">
                                            <span className="bg-brand text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Sun</span>
                                            <span className="bg-brand/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Mon</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">
                                            Active
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button className="text-emerald-500 hover:text-emerald-600 transition-colors">
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </CardContent>
                    <div className="py-3 px-6 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 font-medium shrink-0 bg-gray-50/50">
                        <span>Updated just now</span>
                        <button className="flex items-center gap-1 text-emerald-500 font-bold uppercase tracking-widest hover:text-emerald-600">
                            <RefreshCw size={12} />
                            Refresh
                        </button>
                    </div>
                </Card>
            </div>

            <div className="text-center py-4">
                <span className="text-[10px] font-bold text-brand uppercase tracking-widest">
                    Hearts version 4.4 copilot
                </span>
            </div>
        </div>
    );
}

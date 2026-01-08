import React, { useState, useEffect, useRef } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ScatterChart, Scatter, PieChart, Pie, Cell, Legend
} from 'recharts';
import visService from '../../services/vis.service';

// --- CONSTANTES & ICONS ---
const COLORS = ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#94a3b8', '#64748b', '#cbd5e1'];

const Icons = {
    distribution: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    boxplot: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
    ),
    scatter: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
    ),
    categorical: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
    ),
    correlation: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    )
};

// --- LOGIQUE METIER (Calculs) ---
const calculateBoxPlotStats = (data, columnName) => {
    if (!data || data.length === 0) return null;
    const sorted = data.map(d => parseFloat(d)).filter(d => !isNaN(d)).sort((a, b) => a - b);
    const n = sorted.length;
    if (n === 0) return null;

    const getQuantile = (arr, q) => {
        const pos = (n - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        return arr[base + 1] !== undefined ? arr[base] + rest * (arr[base + 1] - arr[base]) : arr[base];
    };

    const q1 = getQuantile(sorted, 0.25);
    const median = getQuantile(sorted, 0.50);
    const q3 = getQuantile(sorted, 0.75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    let min = q1, max = q3;
    const outliers = [];
    
    for (let i = 0; i < n; i++) if (sorted[i] >= lowerBound) { min = sorted[i]; break; }
    for (let i = n - 1; i >= 0; i--) if (sorted[i] <= upperBound) { max = sorted[i]; break; }
    for (let x of sorted) if (x < lowerBound || x > upperBound) outliers.push(x);

    return { column: columnName, min, q1, median, q3, max, outliers: outliers.slice(0, 200) };
};

// --- SOUS-COMPOSANTS UI ---

// 1. Custom BoxPlot (SVG pur)
const CustomBoxPlot = ({ data, width, height }) => {
    if (!data || !width || !height) return null;
    const margin = { top: 30, bottom: 40, left: 60, right: 20 };
    const chartHeight = Math.max(0, height - margin.top - margin.bottom);
    const chartWidth = Math.max(0, width - margin.left - margin.right);

    const allValues = [data.min, data.max, ...data.outliers];
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    let range = maxVal - minVal || 1;
    const padding = range * 0.1;
    const domainMin = minVal - padding;
    const domainMax = maxVal + padding;

    const yScale = (val) => chartHeight - ((val - domainMin) / (domainMax - domainMin)) * chartHeight;
    const center = chartWidth / 2;
    const boxWidth = Math.min(100, chartWidth * 0.5);

    return (
        <svg width={width} height={height} className="overflow-visible font-sans">
            <defs>
                <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fed7aa" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#fff7ed" stopOpacity={0.8}/>
                </linearGradient>
            </defs>
            <g transform={`translate(${margin.left}, ${margin.top})`}>
                <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#e2e8f0" strokeWidth="1" />
                {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
                    const val = domainMin + t * (domainMax - domainMin);
                    const y = yScale(val);
                    if (!isFinite(y)) return null;
                    return (
                        <g key={i}>
                            <line x1={0} y1={y} x2={chartWidth} y2={y} stroke="#f1f5f9" strokeDasharray="4 4" />
                            <text x={-15} y={y + 4} textAnchor="end" fontSize="11" fill="#94a3b8" fontWeight="500">
                                {val.toFixed(1)}
                            </text>
                        </g>
                    )
                })}
            </g>
            <g transform={`translate(${margin.left}, ${margin.top})`}>
                <line x1={center} y1={yScale(data.min)} x2={center} y2={yScale(data.max)} stroke="#64748b" strokeWidth="2" />
                <line x1={center - boxWidth/4} y1={yScale(data.min)} x2={center + boxWidth/4} y2={yScale(data.min)} stroke="#64748b" strokeWidth="2" />
                <line x1={center - boxWidth/4} y1={yScale(data.max)} x2={center + boxWidth/4} y2={yScale(data.max)} stroke="#64748b" strokeWidth="2" />
                <rect 
                    x={center - boxWidth/2} y={yScale(data.q3)} width={boxWidth} 
                    height={Math.max(2, Math.abs(yScale(data.q1) - yScale(data.q3)))} 
                    fill="url(#orangeGradient)" stroke="#ea580c" strokeWidth="1" rx="4"
                />
                <line x1={center - boxWidth/2} y1={yScale(data.median)} x2={center + boxWidth/2} y2={yScale(data.median)} stroke="#c2410c" strokeWidth="2" />
                {data.outliers.map((val, i) => (
                    <circle key={i} cx={center} cy={yScale(val)} r="3" fill="#ef4444" opacity="0.6" stroke="white" strokeWidth="1" />
                ))}
            </g>
        </svg>
    );
};

// 2. Wrapper BoxPlot (Responsive)
const BoxPlotWrapper = ({ data }) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const containerRef = useRef(null);

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
            }
        };
        updateDimensions();
        const observer = new ResizeObserver(() => window.requestAnimationFrame(updateDimensions));
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full min-h-[300px]">
            {dimensions.width > 0 && <CustomBoxPlot data={data} width={dimensions.width} height={dimensions.height} />}
        </div>
    );
};

// 3. Bouton Menu Sidebar
const MenuButton = ({ id, label, icon, active, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden
                ${active 
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30 translate-x-1' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-orange-600 border border-transparent hover:border-gray-200'
                }`}
        >
            <span className={`transition-colors ${active ? 'text-white' : 'text-gray-400 group-hover:text-orange-500'}`}>
                {icon}
            </span>
            <span>{label}</span>
            {active && <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20"></div>}
        </button>
    );
};

// 4. Custom Select (Dropdown Moderne)
const CustomSelect = ({ label, value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="group relative" ref={containerRef}>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                {label}
            </label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 bg-gray-50 border text-sm rounded-xl transition-all duration-200
                    ${isOpen 
                        ? 'border-orange-500 ring-2 ring-orange-500/20 bg-white' 
                        : 'border-gray-200 hover:bg-white hover:border-gray-300 text-gray-700'
                    }`}
            >
                <span className="truncate font-medium">{value || "Sélectionner..."}</span>
                <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-orange-500' : ''}`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar animate-fadeIn">
                    <ul className="py-1">
                        {options.map((option) => (
                            <li key={option}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange({ target: { value: option } }); // Simule l'event pour compatibilité
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between
                                        ${value === option 
                                            ? 'bg-orange-50 text-orange-700 font-semibold' 
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    {option}
                                    {value === option && (
                                        <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// --- COMPOSANT PRINCIPAL ---
const Visualization = () => {
    const [loading, setLoading] = useState(false);
    const [columns, setColumns] = useState({ numeric: [], categorical: [] });
    const [activeTab, setActiveTab] = useState(null); // Changé à null initialement pour attendre le chargement des données
    const [config, setConfig] = useState({ col1: '', col2: '' });
    const [chartData, setChartData] = useState(null);
    const [correlationData, setCorrelationData] = useState(null);
    const [boxplotData, setBoxplotData] = useState(null);

    const sessionId = localStorage.getItem('current_session_id');

    // Récupération des colonnes et détermination des visualisations compatibles
    useEffect(() => {
        if (sessionId) {
            visService.getColumns(sessionId).then(res => {
                const numeric = res.data.numeric_columns || [];
                const categorical = res.data.categorical_columns || [];
                
                setColumns({ numeric, categorical });

                // --- LOGIQUE DE SELECTION AUTOMATIQUE DE L'ONGLET PAR DÉFAUT ---
                // Si on a des données numériques, on commence par Distribution
                if (numeric.length > 0) {
                    setActiveTab('distribution');
                    setConfig(prev => ({ ...prev, col1: numeric[0] }));
                } 
                // Sinon, si on a du catégoriel, on va sur Categorical
                else if (categorical.length > 0) {
                    setActiveTab('categorical');
                    setConfig(prev => ({ ...prev, col1: categorical[0] }));
                }

            }).catch(err => console.error("Erreur colonnes:", err));
        }
    }, [sessionId]);

    // Récupération des données graphiques
    useEffect(() => {
        if (!sessionId || !config.col1) return;
        const fetchData = async () => {
            setLoading(true);
            setChartData(null); setCorrelationData(null); setBoxplotData(null);
            try {
                if (activeTab === 'distribution') {
                    const res = await visService.getHistogram(sessionId, config.col1);
                    setChartData(processHistogram(res.data.values));
                } else if (activeTab === 'scatter') {
                    if (!config.col2) return;
                    const res = await visService.getScatter(sessionId, config.col1, config.col2);
                    setChartData(res.data.x.map((val, i) => ({ x: val, y: res.data.y[i] })));
                } else if (activeTab === 'categorical') {
                    const res = await visService.getCategorical(sessionId, config.col1);
                    setChartData(res.data.labels.map((l, i) => ({ name: l, value: res.data.values[i] })));
                } else if (activeTab === 'correlation') {
                    const res = await visService.getCorrelation(sessionId);
                    setCorrelationData(res.data);
                } else if (activeTab === 'boxplot') {
                    const res = await visService.getBoxplot(sessionId, config.col1);
                    setBoxplotData(calculateBoxPlotStats(res.data.values, config.col1));
                }
            } catch (err) { console.error("Erreur API:", err); } 
            finally { setLoading(false); }
        };
        fetchData();
    }, [activeTab, config, sessionId]);

    const processHistogram = (data) => {
        if (!data || data.length === 0) return [];
        const min = Math.min(...data), max = Math.max(...data);
        const binCount = 15, binSize = (max - min) / binCount;
        if (binSize === 0) return [{ name: min, count: data.length }];
        const bins = Array.from({ length: binCount }, (_, i) => ({ name: (min + i * binSize).toFixed(1), count: 0 }));
        data.forEach(val => {
            let index = Math.floor((val - min) / binSize);
            if (index >= binCount) index = binCount - 1;
            bins[index].count++;
        });
        return bins;
    };

    const renderChartContent = () => {
        if (loading) return (
            <div className="flex flex-col h-full items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
                <p className="text-gray-400 text-sm font-medium animate-pulse">Chargement des données...</p>
            </div>
        );

        if (activeTab === 'correlation' && correlationData) {
            return (
                <div className="overflow-hidden rounded-xl border border-gray-100 h-full flex flex-col">
                    <div className="overflow-auto custom-scrollbar flex-1">
                        <table className="w-full text-center text-xs border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-3 bg-gray-50 sticky top-0 z-20 border-b border-gray-100"></th>
                                    {correlationData.x.map(col => (
                                        <th key={col} className="p-3 bg-gray-50 font-semibold text-gray-600 sticky top-0 z-10 border-b border-gray-100 min-w-[80px]">
                                            {col.length > 10 ? col.slice(0,8)+'..' : col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {correlationData.y.map((rowLabel, i) => (
                                    <tr key={rowLabel} className="hover:bg-gray-50 transition-colors">
                                        <td className="font-semibold bg-gray-50 p-3 text-right sticky left-0 z-10 border-r border-gray-100 text-gray-600 max-w-[100px] truncate">
                                            {rowLabel}
                                        </td>
                                        {correlationData.z[i].map((val, j) => {
                                            const intensity = Math.abs(val);
                                            const isPositive = val > 0;
                                            const color = isPositive ? '234, 88, 12' : '59, 130, 246';
                                            return (
                                                <td key={j} className="p-1 border border-gray-50">
                                                    <div 
                                                        className="w-full h-8 flex items-center justify-center rounded text-[10px] font-medium transition-transform hover:scale-110"
                                                        style={{ 
                                                            backgroundColor: `rgba(${color}, ${intensity * 0.9})`,
                                                            color: intensity > 0.5 ? 'white' : '#1e293b'
                                                        }}
                                                    >
                                                        {val.toFixed(2)}
                                                    </div>
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        if (activeTab === 'boxplot' && boxplotData) return <BoxPlotWrapper data={boxplotData} />;

        if (!chartData || chartData.length === 0) return (
            <div className="flex flex-col h-full items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 m-4">
                <div className="bg-white p-4 rounded-full shadow-sm mb-3">
                    <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <p>Sélectionnez une colonne pour commencer l'analyse</p>
            </div>
        );

        return (
            <ResponsiveContainer width="100%" height="100%">
                {activeTab === 'distribution' ? (
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ea580c" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#ea580c" stopOpacity={0.4}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                        <YAxis tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                        <Tooltip 
                            cursor={{fill: '#fff7ed', opacity: 0.4}} 
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px'}}
                        />
                        <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                ) : activeTab === 'scatter' ? (
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis type="number" dataKey="x" name={config.col1} tick={{fill: '#94a3b8', fontSize: 12}} axisLine={{stroke: '#e2e8f0'}} tickLine={false} dy={10} />
                        <YAxis type="number" dataKey="y" name={config.col2} tick={{fill: '#94a3b8', fontSize: 12}} axisLine={{stroke: '#e2e8f0'}} tickLine={false} dx={-10} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                        <Scatter name="Data" data={chartData} fill="#ea580c" fillOpacity={0.6} />
                    </ScatterChart>
                ) : (
                    <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={80} outerRadius={130} paddingAngle={2} dataKey="value" stroke="none">
                            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{paddingTop: '20px'}}/>
                    </PieChart>
                )}
            </ResponsiveContainer>
        );
    };

    // --- FILTRAGE DES VISUALISATIONS COMPATIBLES ---
    const getCompatibleVisualizations = () => {
        const options = [];
        
        // Distribution & Boxplot : Besoin d'au moins 1 colonne numérique
        if (columns.numeric.length > 0) {
            options.push({ id: 'distribution', label: 'Distribution', icon: Icons.distribution });
            options.push({ id: 'boxplot', label: 'Box Plot (Outliers)', icon: Icons.boxplot });
        }
        
        // Scatter Plot & Correlation : Besoin d'au moins 2 colonnes numériques
        if (columns.numeric.length >= 2) {
             options.push({ id: 'scatter', label: 'Nuage de points', icon: Icons.scatter });
             options.push({ id: 'correlation', label: 'Corrélation (Heatmap)', icon: Icons.correlation });
        }

        // Categorical (Pie) : Besoin d'au moins 1 colonne catégorielle
        if (columns.categorical.length > 0) {
            options.push({ id: 'categorical', label: 'Répartition (Pie)', icon: Icons.categorical });
        }

        return options;
    };

    const availableVisualizations = getCompatibleVisualizations();

    if (!sessionId) return <div className="p-8 text-center text-gray-500">Aucune session active</div>;

    return (
        <div className="h-[calc(100vh-100px)] flex gap-6 p-6 bg-gray-50/50 font-sans">
            {/* --- SIDEBAR DE CONTROLE --- */}
            <div className="w-80 flex-shrink-0 flex flex-col gap-6">
                <div className="bg-white p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col h-full overflow-visible">
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Type de Visualisation</h3>
                        <div className="space-y-2">
                            {availableVisualizations.length > 0 ? (
                                availableVisualizations.map(type => (
                                    <MenuButton 
                                        key={type.id} 
                                        {...type} 
                                        active={activeTab === type.id} 
                                        onClick={() => {
                                            setActiveTab(type.id);
                                            // Reset des colonnes quand on change de type incompatible
                                            if (type.id === 'categorical') {
                                                setConfig({ col1: columns.categorical[0], col2: '' });
                                            } else {
                                                setConfig({ col1: columns.numeric[0], col2: columns.numeric[1] || '' });
                                            }
                                        }}
                                    />
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 italic">Aucune visualisation compatible détectée.</p>
                            )}
                        </div>
                    </div>

                    {activeTab !== 'correlation' && activeTab !== null && (
                        <div className="pt-6 border-t border-gray-100 space-y-5 animate-fadeIn relative z-40">
                             <CustomSelect 
                                label={activeTab === 'scatter' ? 'Axe X (Numérique)' : 'Colonne à analyser'}
                                value={config.col1}
                                // Si on est sur Pie Chart, on montre les catégorielles, sinon les numériques
                                options={activeTab === 'categorical' ? columns.categorical : columns.numeric}
                                onChange={(e) => setConfig({ ...config, col1: e.target.value })}
                             />
                            
                            {activeTab === 'scatter' && (
                                <CustomSelect 
                                    label="Axe Y (Numérique)"
                                    value={config.col2}
                                    options={columns.numeric}
                                    onChange={(e) => setConfig({ ...config, col2: e.target.value })}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* --- ZONE PRINCIPALE DU GRAPHIQUE --- */}
            <div className="flex-1 bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col relative overflow-hidden z-0">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                            {activeTab === 'distribution' && 'Analyse de Distribution'}
                            {activeTab === 'scatter' && 'Analyse de Corrélation'}
                            {activeTab === 'categorical' && 'Répartition Catégorielle'}
                            {activeTab === 'correlation' && 'Matrice de Corrélation Globale'}
                            {activeTab === 'boxplot' && 'Détection des Outliers'}
                            {!activeTab && 'Chargement...'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1 font-medium">
                            {config.col1 ? (
                                <span className="flex items-center gap-2">
                                    Visualisation de <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">{config.col1}</span>
                                    {config.col2 && <> vs <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">{config.col2}</span></>}
                                </span>
                            ) : 'Sélectionnez les données à visualiser'}
                        </p>
                    </div>
                    {/* Badge Stylisé */}
                    {activeTab && (
                        <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 shadow-sm rounded-lg px-4 py-2 flex items-center gap-2">
                            <span className="text-orange-500">{Icons[activeTab]}</span>
                            <span className="text-xs font-bold text-orange-800 uppercase tracking-wide">
                                {activeTab}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex-1 w-full min-h-0 relative">
                    {renderChartContent()}
                </div>
            </div>
        </div>
    );
};

export default Visualization;
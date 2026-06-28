import React, { useEffect, useState } from 'react';
import { parseSTLAsync, type STLModelData } from './STLParser';
import { ModelViewer } from './ModelViewer';
import { RefreshCw, Box } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const MODELS = [
    {
        id: '3dbenchy.stl',
        nameEn: '3DBenchy',
        nameHe: 'סירת בנצ\'י (Benchy)',
        color: '#f97316', // Vibrant Orange
    },
    {
        id: 'Gear as Wall Decoration.stl',
        nameEn: 'Wall Decoration Gear',
        nameHe: 'גלגל שיניים דקורטיבי (Gear)',
        color: '#14b8a6', // Teal Green
    },
    {
        id: 'Luno_Spinner.stl',
        nameEn: 'Luno Fidget Spinner',
        nameHe: 'ספינר לונו (Spinner)',
        color: '#3b82f6', // Blue
    },
    {
        id: 'Type2_Plumbing_Pipes_thin.stl',
        nameEn: 'Plumbing Pipes',
        nameHe: 'צינורות שרברבות (Pipes)',
        color: '#6b7280', // Cool Slate
    },
    {
        id: 'chess_pawn.stl',
        nameEn: 'Chess Pawn',
        nameHe: 'רגלי שחמט (Pawn)',
        color: '#4b5563', // Charcoal Slate
    },
    {
        id: 'example6.stl',
        nameEn: 'Wall Art Gear',
        nameHe: 'גלגל שיניים קישוטי (Gear)',
        color: '#cbd5e1', // Metallic Silver
    },
    {
        id: 'Mechanical Joint Tolerance Test.stl',
        nameEn: 'Tolerance Joint Test',
        nameHe: 'מבדק סבילות מחברים (Joint Test)',
        color: '#2563eb', // Royal Blue
    }
];

let initialRandomModel: typeof MODELS[0] | null = null;

export const HomeModelViewer: React.FC = () => {
    const { language } = useLanguage();
    const [selectedModel] = useState<typeof MODELS[0]>(() => {
        if (!initialRandomModel) {
            const randomIdx = Math.floor(Math.random() * MODELS.length);
            initialRandomModel = MODELS[randomIdx];
        }
        return initialRandomModel;
    });
    const [modelData, setModelData] = useState<STLModelData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);

        fetch(`/models/${selectedModel.id}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Failed to fetch model: status ${res.status}`);
                }
                return res.arrayBuffer();
            })
            .then(async (buffer) => {
                if (!active) return;
                try {
                    const parsed = await parseSTLAsync(buffer);
                    if (!active) return;
                    setModelData(parsed);
                    setLoading(false);
                } catch (parseErr: any) {
                    if (!active) return;
                    console.error('Error parsing STL:', parseErr);
                    setError(language === 'he' ? 'שגיאה בפענוח קובץ תלת-מימד' : 'Failed to parse 3D file');
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (!active) return;
                console.error('Error loading home model:', err);
                setError(language === 'he' ? 'שגיאה בטעינת תצוגה תלת-מימדית' : 'Failed to load 3D preview');
                setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [selectedModel.id, language]);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-[220px]">
                <RefreshCw className="h-8 w-8 animate-spin" style={{ color: 'var(--primary)' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {language === 'he' ? 'טוען מודל תלת-מימדי...' : 'Loading 3D model...'}
                </span>
            </div>
        );
    }

    if (error || !selectedModel || !modelData) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-[220px] text-center p-4">
                <Box className="h-10 w-10 text-slate-300 animate-bounce" />
                <span className="text-xs text-red-500 font-semibold">{error || 'Error'}</span>
            </div>
        );
    }

    return (
        <div className="w-full h-full rounded-3xl overflow-hidden">
            <ModelViewer
                data={modelData}
                color={selectedModel.color}
                materialType="glossy"
                autoRotate={true}
                isMinimal={true}
            />
        </div>
    );
};

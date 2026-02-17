
interface ResultCardProps {
    text: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ text }) => {
    return (
        <div className="w-full bg-slate-50 rounded-2xl p-6 min-h-[160px] flex flex-col justify-between border border-slate-100 relative group">
            {text ? (
                <p className="text-xl text-slate-800 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-500">
                    "{text}"
                </p>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-50"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    <p className="text-sm">Votre texte apparaîtra ici</p>
                </div>
            )}

            {text && (
                <button
                    onClick={() => { navigator.clipboard.writeText(text) }}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="Copier le texte"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                </button>
            )}
        </div>
    );
};


interface HistoryListProps {
    history: string[];
}

export const HistoryList: React.FC<HistoryListProps> = ({ history }) => {
    return (
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
            {history.length > 0 ? (
                <div className="text-xs text-slate-400">
                    <p className="font-semibold mb-2 uppercase tracking-wider">Historique récent</p>
                    <div className="space-y-1">
                        {history.map((h, i) => (
                            <p key={i} className="truncate max-w-xs mx-auto">"{h}"</p>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-xs text-slate-400">
                    Autorisez l'accès au microphone lorsque demandé.
                </p>
            )}
        </div>
    );
};

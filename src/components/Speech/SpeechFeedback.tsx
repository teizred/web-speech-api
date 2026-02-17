
interface SpeechFeedbackProps {
    isListening: boolean;
    error: string | null;
}

export const SpeechFeedback: React.FC<SpeechFeedbackProps> = ({ isListening, error }) => {
    return (
        <>
            <div className="text-center h-6">
                {isListening ? (
                    <span className="text-red-500 font-semibold animate-pulse tracking-wide uppercase text-xs">● Écoute en cours...</span>
                ) : (
                    <span className="text-slate-400 text-sm font-medium">Cliquez sur le micro pour parler</span>
                )}
            </div>

            {error && (
                <div className="w-full bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center space-x-2 animate-in fade-in slide-in-from-top-2 border border-red-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                    <span>{error}</span>
                </div>
            )}
        </>
    );
};

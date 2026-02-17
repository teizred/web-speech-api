
interface MicButtonProps {
    isListening: boolean;
    onClick: () => void;
}

export const MicButton: React.FC<MicButtonProps> = ({ isListening, onClick }) => {
    return (
        <div className="relative group">
            {isListening && (
                <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
            )}
            {isListening && (
                <div className="absolute -inset-4 bg-red-200 rounded-full animate-pulse opacity-50 blur-lg"></div>
            )}

            <button
                onClick={onClick}
                className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform 
                    ${isListening
                        ? 'bg-linear-to-br from-red-500 to-pink-600 text-white scale-110 rotate-0'
                        : 'bg-white text-blue-600 border-2 border-slate-100 hover:border-blue-200 hover:scale-105 active:scale-95'
                    }
                `}
            >
                {isListening ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                )}
            </button>
        </div>
    );
};

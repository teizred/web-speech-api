
export const SpeechHeader = () => {
    return (
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 "></div>
            <h1 className="text-3xl font-bold text-white mb-2 relative z-10 tracking-tight">
                Reconnaissance Vocale
            </h1>
            <p className="text-blue-100 text-sm font-medium relative z-10">
                Convertissez votre voix en texte instantanément
            </p>
        </div>
    );
};

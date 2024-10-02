const { useState, useEffect } = React;

const Dialog = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    
    return (
        <div className="dialog-overlay">
            <div className="dialog-content">
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-green-800">Your Forest</h2>
                    <button onClick={onClose} className="text-green-800 text-2xl">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

const Tree = ({ progress, isWithering }) => {
    const baseSize = 48;
    const maxSize = 120;
    const currentSize = baseSize + (progress / 100) * (maxSize - baseSize);
    
    const treeColor = isWithering ? '#EF4444' : '#15803D';
    
    const treeStyle = {
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        transition: 'all 0.5s',
    };
    
    if (progress < 50) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width={currentSize} height={currentSize} viewBox="0 0 24 24" 
                className={`transition-all duration-500 ${isWithering ? 'animate-withering' : 'animate-grow'}`}
                style={treeStyle}>
                <path d="M12 8C12 8 12 2 18 2C18 8 12 8 12 8" stroke={treeColor} fill={treeColor} strokeWidth="0.5"/>
                <path d="M12 8C12 8 12 2 6 2C6 8 12 8 12 8" stroke={treeColor} fill={treeColor} strokeWidth="0.5"/>
                <line x1="12" y1="8" x2="12" y2="22" stroke={treeColor} strokeWidth="2"/>
                <path d="M12 14C12 14 12 8 18 8C18 14 12 14 12 14" stroke={treeColor} fill={treeColor} strokeWidth="0.5"/>
                <path d="M12 14C12 14 12 8 6 8C6 14 12 14 12 14" stroke={treeColor} fill={treeColor} strokeWidth="0.5"/>
            </svg>
        );
    } else {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width={currentSize} height={currentSize} viewBox="0 0 24 24" 
                className={`transition-all duration-500 ${isWithering ? 'animate-withering' : 'animate-grow'}`}
                style={treeStyle}>
                <path d="M12,2L8,9L16,9Z" stroke={treeColor} fill={treeColor} strokeWidth="0.5"/>
                <path d="M12,6L7,14L17,14Z" stroke={treeColor} fill={treeColor} strokeWidth="0.5"/>
                <path d="M12,10L6,19L18,19Z" stroke={treeColor} fill={treeColor} strokeWidth="0.5"/>
                <rect x="11" y="19" width="2" height="3" fill="#5B3E31"/>
            </svg>
        );
    }
};

const ForestTimer = () => {
    const SESSION_TIME = 25 * 60;
    const [timeLeft, setTimeLeft] = useState(SESSION_TIME);
    const [isActive, setIsActive] = useState(false);
    const [trees, setTrees] = useState([]);
    const [isWithering, setIsWithering] = useState(false);
    const [showWitherMessage, setShowWitherMessage] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const growthProgress = ((SESSION_TIME - timeLeft) / SESSION_TIME) * 100;

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            setTrees(prevTrees => [...prevTrees, {
                id: prevTrees.length + 1,
                plantedAt: new Date(),
                isNew: true
            }]);
            setTimeLeft(SESSION_TIME);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (isActive && document.hidden) {
                stopSession('You switched tabs or apps. Your tree withered.');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isActive]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const startSession = () => {
        setIsActive(true);
        setIsWithering(false);
        setShowWitherMessage(false);
    };

    const stopSession = (message = 'Session stopped. Your tree withered.') => {
        setIsActive(false);
        setIsWithering(true);
        setShowWitherMessage(message);
        
        setTimeout(() => {
            setTimeLeft(SESSION_TIME);
            setIsWithering(false);
            setTimeout(() => setShowWitherMessage(false), 2000);
        }, 3000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-green-200">
                <div className="p-8">
                    <div className="flex flex-col items-center">
                        <h1 className="text-3xl font-bold text-green-800 mb-6">Focus Forest</h1>
                        
                        <div className="tree-container mb-6">
                            <div className="ground"></div>
                            <Tree progress={growthProgress} isWithering={isWithering} />
                            {showWitherMessage && (
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm animate-fade-in mt-4">
                                    {showWitherMessage}
                                </div>
                            )}
                        </div>
                        
                        <div className="text-5xl font-bold text-green-800 mb-8 font-mono">
                            {formatTime(timeLeft)}
                        </div>
                        
                        <div className="flex w-full space-x-4 mb-4">
                            <button 
                                onClick={startSession}
                                className={`flex-1 px-6 py-3 rounded-lg text-lg font-semibold transition-all ${
                                    isActive 
                                        ? 'bg-green-100 text-green-400 cursor-not-allowed' 
                                        : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                                }`}
                                disabled={isActive}
                            >
                                Start
                            </button>
                            <button 
                                onClick={() => stopSession()}
                                className={`flex-1 px-6 py-3 rounded-lg text-lg font-semibold transition-all ${
                                    !isActive 
                                        ? 'bg-red-100 text-red-400 cursor-not-allowed' 
                                        : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'
                                }`}
                                disabled={!isActive}
                            >
                                Stop
                            </button>
                        </div>

                        <button 
                            onClick={() => setIsDialogOpen(true)}
                            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700 transition-all hover:shadow-lg flex items-center justify-center"
                        >
                            <Tree progress={100} isWithering={false} />
                            <span className="ml-2">Your Forest ({trees.length} trees)</span>
                        </button>
                    </div>
                </div>
            </div>

            <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                <div className="p-4">
                    {trees.length === 0 ? (
                        <div className="text-center py-8 text-green-600">
                            <Tree progress={100} isWithering={false} />
                            <p className="mt-4 text-lg">Your forest is empty. Complete a focus session to grow your first tree!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                            {trees.map(tree => (
                                <div key={tree.id} className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                                    <Tree progress={100} isWithering={false} />
                                    <span className="mt-2 text-sm text-green-700">
                                        {tree.plantedAt.toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Dialog>
        </div>
    );
};

ReactDOM.render(<ForestTimer />, document.getElementById('root'));
console.log("app.js is loading");

const Dialog = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    
    return (
        <div className="dialog-overlay">
            <div className="dialog-content">
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-green-800">Your Forest</h2>
                    <button onClick={onClose} className="text-green-800 text-2xl">×</button>
                </div>
                {children}
            </div>
        </div>
    );
};

const Tree = ({ progress, isWithering, isActive }) => {
    const baseSize = 48;
    const maxSize = 120;
    const currentSize = baseSize + (progress / 100) * (maxSize - baseSize);
    
    const treeColor = isWithering ? '#EF4444' : (isActive ? '#15803D' : '#22C55E');
    
    const treeStyle = {
        position: 'absolute',
        bottom: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        transition: 'all 0.5s',
        zIndex: 10,
    };
    
    // Sapling shape
    if (!isActive || progress < 50) {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={currentSize}
                height={currentSize}
                viewBox="0 0 24 24"
                className={`transition-all duration-500 ${isWithering ? 'animate-withering' : 'animate-grow'}`}
                style={treeStyle}
            >
                <path 
                    d="M12 3v13M12 6l-2 2M12 6l2 2M12 10l-2 2M12 10l2 2M12 14l-2 2M12 14l2 2" 
                    stroke={treeColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
                <ellipse
                    cx="12"
                    cy="21"
                    rx="5"
                    ry="1"
                    fill="#8B4513"
                />
            </svg>
        );
    } else {
        // Full tree shape
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={currentSize}
                height={currentSize}
                viewBox="0 0 24 24"
                className={`transition-all duration-500 ${isWithering ? 'animate-withering' : 'animate-grow'}`}
                style={treeStyle}
            >
                <path 
                    d="M12 2L5 22h14L12 2z" 
                    fill={treeColor} 
                />
                <rect 
                    x="11" 
                    y="20" 
                    width="2" 
                    height="4" 
                    fill="#8B4513" 
                />
            </svg>
        );
    }
};

const ForestTimer = () => {
    const [timeLeft, setTimeLeft] = React.useState(25 * 60);
    const [isActive, setIsActive] = React.useState(false);
    const [trees, setTrees] = React.useState([]);
    const [isWithering, setIsWithering] = React.useState(false);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [showWarning, setShowWarning] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);
    const [wakeLock, setWakeLock] = React.useState(null);

    const SESSION_TIME = 25 * 60;
    const growthProgress = ((SESSION_TIME - timeLeft) / SESSION_TIME) * 100;

    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        };
        checkMobile();

        const handleVisibilityChange = () => {
            if (isActive && document.hidden) {
                if (isMobile) {
                    setShowWarning(true);
                } else {
                    handleFail();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isActive, isMobile]);

    React.useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleSuccess();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    React.useEffect(() => {
        const requestWakeLock = async () => {
            if (isActive && 'wakeLock' in navigator) {
                try {
                    const lock = await navigator.wakeLock.request('screen');
                    setWakeLock(lock);
                } catch (err) {
                    console.error(`Failed to acquire wake lock: ${err.message}`);
                }
            }
        };

        const releaseWakeLock = () => {
            if (wakeLock) {
                wakeLock.release().then(() => {
                    setWakeLock(null);
                });
            }
        };

        if (isActive) {
            requestWakeLock();
        } else {
            releaseWakeLock();
        }

        return () => {
            releaseWakeLock();
        };
    }, [isActive]);

    const handleStart = () => {
        setIsActive(true);
        setIsWithering(false);
    };

    const handleSuccess = () => {
        setIsActive(false);
        setIsWithering(false);
        const newTree = {
            id: Date.now(),
            plantedAt: new Date().toISOString()
        };
        setTrees([...trees, newTree]);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setTimeLeft(SESSION_TIME);
    };

    const handleFail = () => {
        setIsActive(false);
        setIsWithering(true);
        setTimeLeft(SESSION_TIME);
        setTimeout(() => setIsWithering(false), 3000);
    };

    const handleContinue = () => {
        setShowWarning(false);
    };

    const handleLeave = () => {
        setShowWarning(false);
        handleFail();
    };

    return (
        <div className="min-h-screen natural-background">
            <div className="sky"></div>
            <div className="cloud"></div>
            <div className="cloud"></div>
            <div className="cloud"></div>
            <div className="grass"></div>
            <div className="content-container">
                <div className="bg-white bg-opacity-90 rounded-2xl shadow-2xl border border-green-200 p-8 w-full max-w-md">
                    <div className="flex flex-col items-center">
                        <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">Focus Forest</h1>
                        <div className="tree-container mb-6">
                            <div className="ground"></div>
                            <Tree progress={growthProgress} isWithering={isWithering} isActive={isActive} />
                        </div>
                        <div className="timer-display mb-8">
                            {`${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`}
                        </div>
                        <button
                            onClick={handleStart}
                            className={`w-full px-6 py-3 rounded-lg text-lg font-semibold transition-all ${
                                isActive 
                                    ? 'bg-green-100 text-green-400 cursor-not-allowed' 
                                    : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                            }`}
                            disabled={isActive}
                        >
                            {isActive ? 'Focus in progress...' : 'Start Focus'}
                        </button>
                        <button
                            onClick={() => setIsDialogOpen(true)}
                            className="w-full mt-4 px-6 py-3 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700 transition-all hover:shadow-lg"
                        >
                            {`Your Forest (${trees.length} trees)`}
                        </button>
                    </div>
                </div>
            </div>
            <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                <div className="p-4">
                    {trees.length === 0 ? (
                        <div className="text-center py-8 text-green-600">
                            <p className="mt-4 text-lg">Your forest is empty. Complete a focus session to grow your first tree!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                            {trees.map(tree => (
                                <div key={tree.id} className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                                    <Tree progress={100} isWithering={false} isActive={false} />
                                    <span className="mt-2 text-sm text-green-700">
                                        {new Date(tree.plantedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Dialog>
            {showSuccess && (
                <div className="success-message">
                    <h2 className="text-xl font-bold mb-2">Congratulations!</h2>
                    <p>Your tree has grown fully. Great work on staying focused!</p>
                </div>
            )}
            <Dialog isOpen={showWarning} onClose={() => setShowWarning(false)}>
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-4 text-red-600">Warning!</h2>
                    <p className="mb-4">The focus activity will fail and the tree will disintegrate if you leave.</p>
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={handleContinue}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Continue
                        </button>
                        <button
                            onClick={handleLeave}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Leave
                        </button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

ReactDOM.render(<ForestTimer />, document.getElementById('root'));

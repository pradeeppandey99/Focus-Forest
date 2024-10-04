const ForestTimer = () => {
    const [timeLeft, setTimeLeft] = React.useState(25 * 60);
    const [isActive, setIsActive] = React.useState(false);
    const [trees, setTrees] = React.useState([]);
    const [isWithering, setIsWithering] = React.useState(false);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [showWarning, setShowWarning] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);

    const SESSION_TIME = 25 * 60;
    const growthProgress = ((SESSION_TIME - timeLeft) / SESSION_TIME) * 100;

    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);

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
            window.removeEventListener('resize', checkMobile);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isActive, isMobile]);

    React.useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleSuccess();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const handleStart = () => {
        if (!isActive) {
            setIsActive(true);
            setIsWithering(false);
        }
    };

    const handleSuccess = () => {
        setIsActive(false);
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
                            <Tree progress={growthProgress} isWithering={isWithering} />
                        </div>
                        
                        <div className="timer-display mb-8">
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
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
                            Your Forest ({trees.length} trees)
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
                                    <Tree progress={100} isWithering={false} />
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

            {showWarning && (
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
            )}
        </div>
    );
};

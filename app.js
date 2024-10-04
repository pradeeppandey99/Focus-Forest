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

    const handleStart = () => {
        setIsActive(true);
        setIsWithering(false);
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
            {/* ... (rest of the JSX remains unchanged) ... */}

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

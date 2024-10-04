console.log("app.js is loading");

const Dialog = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    
    return React.createElement('div', { className: "dialog-overlay" },
        React.createElement('div', { className: "dialog-content" },
            React.createElement('div', { className: "flex justify-between items-start" },
                React.createElement('h2', { className: "text-2xl font-bold text-green-800" }, "Your Forest"),
                React.createElement('button', { onClick: onClose, className: "text-green-800 text-2xl" }, "×")
            ),
            children
        )
    );
};

const Tree = ({ progress, isWithering, isActive }) => {
    const baseSize = 48;
    const maxSize = 120;
    const currentSize = baseSize + (progress / 100) * (maxSize - baseSize);
    
    const treeColor = isWithering ? '#EF4444' : (isActive ? '#15803D' : '#22C55E');
    
    const treeStyle = {
        position: 'absolute',
        bottom: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        transition: 'all 0.5s',
        zIndex: 10,
    };
    
    // Always show the sapling when the timer is not active
    if (!isActive || progress < 50) {
        return React.createElement('svg', {
            xmlns: "http://www.w3.org/2000/svg",
            width: currentSize,
            height: currentSize,
            viewBox: "0 0 24 24",
            className: `transition-all duration-500 ${isWithering ? 'animate-withering' : 'animate-grow'}`,
            style: treeStyle
        },
            React.createElement('path', { d: "M7 17.9V19.9C7 21.6 8.3 22.9 10 22.9H14C15.7 22.9 17 21.6 17 19.9V17.9H7Z", fill: treeColor }),
            React.createElement('path', { d: "M17 14.9C17 16.6 15.7 17.9 14 17.9H10C8.3 17.9 7 16.6 7 14.9C7 13.2 8.3 11.9 10 11.9H14C15.7 11.9 17 13.2 17 14.9Z", fill: treeColor }),
            React.createElement('path', { d: "M14 11.9C15.7 11.9 17 10.6 17 8.9C17 7.2 15.7 5.9 14 5.9H13V1.9H11V5.9H10C8.3 5.9 7 7.2 7 8.9C7 10.6 8.3 11.9 10 11.9H14Z", fill: treeColor })
        );
    } else {
        return React.createElement('svg', {
            xmlns: "http://www.w3.org/2000/svg",
            width: currentSize,
            height: currentSize,
            viewBox: "0 0 24 24",
            className: `transition-all duration-500 ${isWithering ? 'animate-withering' : 'animate-grow'}`,
            style: treeStyle
        },
            React.createElement('path', { d: "M12,2L8,9L16,9Z", stroke: treeColor, fill: treeColor, strokeWidth: "0.5" }),
            React.createElement('path', { d: "M12,6L7,14L17,14Z", stroke: treeColor, fill: treeColor, strokeWidth: "0.5" }),
            React.createElement('path', { d: "M12,10L6,19L18,19Z", stroke: treeColor, fill: treeColor, strokeWidth: "0.5" }),
            React.createElement('rect', { x: "11", y: "19", width: "2", height: "3", fill: "#5B3E31" })
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

    const SESSION_TIME = 25 * 60;
    const growthProgress = ((SESSION_TIME - timeLeft) / SESSION_TIME) * 100;

    React.useEffect(() => {
        console.log("useEffect for mobile detection and visibility change is running");
        const checkMobile = () => {
            setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        };
        checkMobile();

        const handleVisibilityChange = () => {
            console.log("Visibility changed, document.hidden:", document.hidden);
            if (isActive && document.hidden) {
                if (isMobile) {
                    console.log("Mobile device, showing warning");
                    setShowWarning(true);
                } else {
                    console.log("Desktop device, failing session");
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
        console.log("Timer useEffect is running, isActive:", isActive, "timeLeft:", timeLeft);
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
        console.log("handleStart called");
        setIsActive(true);
        setIsWithering(false);
    };

    const handleSuccess = () => {
        console.log("handleSuccess called");
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
        console.log("handleFail called");
        setIsActive(false);
        setIsWithering(true);
        setTimeLeft(SESSION_TIME);
        // Add a timeout to reset the withering state and show green sapling again
        setTimeout(() => setIsWithering(false), 3000);
    };

    const handleContinue = () => {
        console.log("handleContinue called");
        setShowWarning(false);
    };

    const handleLeave = () => {
        console.log("handleLeave called");
        setShowWarning(false);
        handleFail();
    };

    return React.createElement('div', { className: "min-h-screen natural-background" },
        React.createElement('div', { className: "sky" }),
        React.createElement('div', { className: "cloud" }),
        React.createElement('div', { className: "cloud" }),
        React.createElement('div', { className: "cloud" }),
        React.createElement('div', { className: "grass" }),
        React.createElement('div', { className: "content-container" },
            React.createElement('div', { className: "bg-white bg-opacity-90 rounded-2xl shadow-2xl border border-green-200 p-8 w-full max-w-md" },
                React.createElement('div', { className: "flex flex-col items-center" },
                    React.createElement('h1', { className: "text-3xl font-bold text-green-800 mb-6 text-center" }, "Focus Forest"),
                    React.createElement('div', { className: "tree-container mb-6" },
                        React.createElement('div', { className: "ground" }),
                        React.createElement(Tree, { progress: growthProgress, isWithering: isWithering, isActive: isActive })
                    ),
                    React.createElement('div', { className: "timer-display mb-8" },
                        `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`
                    ),
                    React.createElement('button', {
                        onClick: handleStart,
                        className: `w-full px-6 py-3 rounded-lg text-lg font-semibold transition-all ${
                            isActive 
                                ? 'bg-green-100 text-green-400 cursor-not-allowed' 
                                : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                        }`,
                        disabled: isActive
                    }, isActive ? 'Focus in progress...' : 'Start Focus'),
                    React.createElement('button', {
                        onClick: () => setIsDialogOpen(true),
                        className: "w-full mt-4 px-6 py-3 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700 transition-all hover:shadow-lg"
                    }, `Your Forest (${trees.length} trees)`)
                )
            )
        ),
        React.createElement(Dialog, { isOpen: isDialogOpen, onClose: () => setIsDialogOpen(false) },
            React.createElement('div', { className: "p-4" },
                trees.length === 0
                    ? React.createElement('div', { className: "text-center py-8 text-green-600" },
                        React.createElement('p', { className: "mt-4 text-lg" }, "Your forest is empty. Complete a focus session to grow your first tree!")
                    )
                    : React.createElement('div', { className: "grid grid-cols-2 sm:grid-cols-3 gap-6" },
                        trees.map(tree => 
                            React.createElement('div', { key: tree.id, className: "flex flex-col items-center p-4 bg-green-50 rounded-lg" },
                                React.createElement(Tree, { progress: 100, isWithering: false, isActive: false }),
                                React.createElement('span', { className: "mt-2 text-sm text-green-700" },
                                    new Date(tree.plantedAt).toLocaleDateString()
                                )
                            )
                        )
                    )
            )
        ),
        showSuccess && React.createElement('div', { className: "success-message" },
            React.createElement('h2', { className: "text-xl font-bold mb-2" }, "Congratulations!"),
            React.createElement('p', null, "Your tree has grown fully. Great work on staying focused!")
        ),
        showWarning && React.createElement(Dialog, { isOpen: showWarning, onClose: () => setShowWarning(false) },
            React.createElement('div', { className: "p-4" },
                React.createElement('h2', { className: "text-xl font-bold mb-4 text-red-600" }, "Warning!"),
                React.createElement('p', { className: "mb-4" }, "The focus activity will fail and the tree will disintegrate if you leave."),
                React.createElement('div', { className: "flex justify-end space-x-4" },
                    React.createElement('button', {
                        onClick: handleContinue,
                        className: "px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    }, "Continue"),
                    React.createElement('button', {
                        onClick: handleLeave,
                        className: "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    }, "Leave")
                )
            )
        )
    );
};

console.log("Rendering ForestTimer component");
ReactDOM.render(React.createElement(ForestTimer), document.getElementById('root'));

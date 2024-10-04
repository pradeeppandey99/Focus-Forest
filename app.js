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
    const trunkColor = '#8B4513';
    
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
        return React.createElement('svg', {
            xmlns: "http://www.w3.org/2000/svg",
            width: currentSize,
            height: currentSize,
            viewBox: "0 0 24 24",
            className: `transition-all duration-500 ${isWithering ? 'animate-withering' : 'animate-grow'}`,
            style: treeStyle
        },
            // Trunk
            React.createElement('path', {
                d: "M12 22V12",
                stroke: trunkColor,
                strokeWidth: "2",
                strokeLinecap: "round"
            }),
            // Leaves
            React.createElement('path', {
                d: "M12 12C12 12 9 9 9 6C9 3 12 2 12 2C12 2 15 3 15 6C15 9 12 12 12 12Z",
                fill: treeColor,
                stroke: treeColor,
                strokeWidth: "0.5"
            })
        );
    } else {
        // Full tree shape
        return React.createElement('svg', {
            xmlns: "http://www.w3.org/2000/svg",
            width: currentSize,
            height: currentSize,
            viewBox: "0 0 24 24",
            className: `transition-all duration-500 ${isWithering ? 'animate-withering' : 'animate-grow'}`,
            style: treeStyle
        },
            // Trunk
            React.createElement('path', {
                d: "M12 22V8",
                stroke: trunkColor,
                strokeWidth: "2",
                strokeLinecap: "round"
            }),
            // Tree body
            React.createElement('path', {
                d: "M12 8C12 8 5 8 2 14C2 20 12 22 12 22C12 22 22 20 22 14C19 8 12 8 12 8Z",
                fill: treeColor,
                stroke: treeColor,
                strokeWidth: "0.5"
            }),
            // Upper part
            React.createElement('path', {
                d: "M12 2C12 2 7 4 7 8C7 12 12 14 12 14C12 14 17 12 17 8C17 4 12 2 12 2Z",
                fill: treeColor,
                stroke: treeColor,
                strokeWidth: "0.5"
            })
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

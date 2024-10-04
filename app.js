const { useState, useEffect, createElement: h } = React;

const Sprout = ({ className, size, style }) => h('svg', {
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: className,
  style: style
}, [
  h('path', { d: "M7 20h10", key: 1 }),
  h('path', { d: "M12 20v-9", key: 2 }),
  h('path', { d: "M9 3.6c-1.2.6-2 2-2 3.4 0 2.2 1.8 4 4 4", key: 3 }),
  h('path', { d: "M15 3.6c1.2.6 2 2 2 3.4 0 2.2-1.8 4-4 4", key: 4 })
]);

const TreePine = ({ className, size, style }) => h('svg', {
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: className,
  style: style
}, [
  h('path', { d: "m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z", key: 1 }),
  h('path', { d: "M12 22v-3", key: 2 })
]);

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
        bottom: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        transition: 'all 0.5s',
        zIndex: 10,
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

const WarningModal = ({ onContinue, onLeave }) => (
    <div className="dialog-overlay">
        <div className="dialog-content">
            <h2 className="text-xl font-bold mb-4 text-red-600">Warning!</h2>
            <p className="mb-6">The focus activity will fail and the tree will disintegrate if you leave this window.</p>
            <div className="flex justify-between">
                <button onClick={onContinue} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Continue</button>
                <button onClick={onLeave} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Leave</button>
            </div>
        </div>
    </div>
);

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
        setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }, []);

    React.useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            const newTree = {
                id: Date.now(),
                plantedAt: new Date().toISOString()
            };
            setTrees([...trees, newTree]);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            setTimeLeft(SESSION_TIME);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    React.useEffect(() => {
        const handleVisibilityChange = () => {
            if (isActive && document.hidden) {
                if (isMobile) {
                    setShowWarning(true);
                } else {
                    handleLeave();
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [isActive, isMobile]);

    const handleStart = () => {
        if (!isActive) {
            setIsActive(true);
            setIsWithering(false);
        }
    };

    const handleLeave = () => {
        setIsActive(false);
        setIsWithering(true);
        setTimeLeft(SESSION_TIME);
        setShowWarning(false);
    };

    const handleContinue = () => {
        setShowWarning(false);
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

            {showWarning && <WarningModal onContinue={handleContinue} onLeave={handleLeave} />}
        </div>
    );
};

ReactDOM.render(<ForestTimer />, document.getElementById('root'));

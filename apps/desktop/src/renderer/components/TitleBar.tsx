import { Minus, Square, X } from 'lucide-react';

export function TitleBar() {
  const handleMinimize = () => window.electron.window.minimize();
  const handleMaximize = () => window.electron.window.maximize();
  const handleClose = () => window.electron.window.close();

  return (
    <div className="h-10 bg-vanilla-dark-100 flex items-center justify-between px-4 drag-region border-b border-vanilla-dark-300">
      {/* Logo and Title */}
      <div className="flex items-center gap-3 no-drag">
        <img src="/logo.svg" alt="Logo" className="w-5 h-5" />
        <span className="text-sm font-medium text-white">Vanilla DNS Changer</span>
      </div>

      {/* Window Controls */}
      <div className="flex items-center no-drag">
        <button
          onClick={handleMinimize}
          className="w-10 h-10 flex items-center justify-center hover:bg-vanilla-dark-200 transition-colors"
          aria-label="Minimize"
        >
          <Minus className="w-4 h-4 text-gray-400" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-10 h-10 flex items-center justify-center hover:bg-vanilla-dark-200 transition-colors"
          aria-label="Maximize"
        >
          <Square className="w-3 h-3 text-gray-400" />
        </button>
        <button
          onClick={handleClose}
          className="w-10 h-10 flex items-center justify-center hover:bg-red-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-gray-400 hover:text-white" />
        </button>
      </div>
    </div>
  );
}

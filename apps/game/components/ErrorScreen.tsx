interface ErrorScreenProps {
  error: string;
  onRetry: () => void;
}

export default function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
  return (
    <div className="game-container flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-game-card rounded-lg border border-game-border p-8 text-center">
          <h1 className="text-2xl font-bold text-game-danger mb-4">Error</h1>
          <p className="text-game-text mb-6">{error}</p>
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-game-gold hover:bg-yellow-600 text-black font-bold rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
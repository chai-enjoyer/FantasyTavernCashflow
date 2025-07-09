export default function LoadingScreen() {
  return (
    <div className="game-container flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-game-gold mx-auto mb-4"></div>
        <p className="text-game-text text-lg">Загрузка Фэнтезийной Таверны...</p>
      </div>
    </div>
  );
}
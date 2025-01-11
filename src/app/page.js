import Link from "next/link";

export default function Home() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">🚀 Welcome to Hype.mba!</h1>
      <p className="mb-8">Launch your memecoins in seconds.</p>

      <div className="space-x-4">
        <Link href="/board">
          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg">📈 View Board</button>
        </Link>

        <Link href="/create">
          <button className="px-6 py-2 bg-green-500 text-white rounded-lg">🪙 Create Token</button>
        </Link>
      </div>
    </div>
  );
}
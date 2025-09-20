import CapsuleList from "../components/CapsuleList";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900 px-4 py-10">
      <div className="w-full max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 mb-6 text-center">
          My Capsules
        </h1>
        <p className="text-center text-zinc-300 dark:text-zinc-500 mb-8">
          View all your time capsules here. Capsules remain locked until their unlock date.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CapsuleList />
        </div>
      </div>
    </div>
  );
}

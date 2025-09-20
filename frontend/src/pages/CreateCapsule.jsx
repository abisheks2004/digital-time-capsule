import CapsuleForm from "../components/CapsuleForm";

export default function CreateCapsule() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900 px-4 py-10">
      <div className="w-full max-w-3xl bg-zinc-700 dark:bg-zinc-100 rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">
           Digital Time Capsule
        </h1>
        <p className="text-center text-zinc-200 dark:text-zinc-800 mb-8">
          Write a message, attach media, set unlock date and time, and share your capsule with friends!
        </p>
        <CapsuleForm />
      </div>
    </div>
  );
}

import CapsuleForm from "../components/CapsuleForm";

export default function CreateCapsule() {
  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-8">
      <div className="glass-panel w-full max-w-4xl rounded-[30px] p-6 sm:p-8 lg:p-10">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-rose-400 text-3xl shadow-lg shadow-amber-500/20">
            ✨
          </div>
          <h1 className="text-3xl font-black text-gradient sm:text-4xl lg:text-5xl">
            Digital Time Capsule
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
            Write a message, attach media, set an unlock date, and share a future moment with the people who matter most.
          </p>
        </div>
        <CapsuleForm />
      </div>
    </div>
  );
}

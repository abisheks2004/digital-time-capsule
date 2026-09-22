import CapsuleForm from "../components/CapsuleForm";

export default function CreateCapsule() {
  return (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center px-4 py-2 sm:py-4">
      <div className="w-full max-w-4xl">
        <CapsuleForm />
      </div>
    </div>
  );
}

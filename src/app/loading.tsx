export default function Loading() {
  return (
    <div className="w-full flex justify-center items-center py-24" role="status" aria-label="Loading">
      <span className="w-10 h-10 rounded-full border-4 border-white/30 border-t-white animate-spin" />
    </div>
  );
}

import Spinner from '@/components/ui/Spinner';

export default function Loading() {
  return (
    <div className="w-full flex justify-center items-center py-24">
      <Spinner size="lg" />
    </div>
  );
}

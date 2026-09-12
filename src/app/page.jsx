import Herosection from '@/components/Herosection';
import DiscoverSection from '@/components/DiscoverSection';

export default function Home() {
  return (
    <div className="w-full flex flex-col gap-12">
      <Herosection />
      <DiscoverSection />
    </div>
  );
}
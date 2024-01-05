import { ReactNode } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

const responsive = {
  mobile: {
    breakpoint: { max: 4000, min: 0 },
    items: 1,
  },
};

export default function ImageSlide({ children }: { children: ReactNode }) {
  return (
    <>
      <Carousel containerClass="w-full relative z-0 h-[100%]" responsive={responsive}>
        {children}
      </Carousel>
    </>
  );
}

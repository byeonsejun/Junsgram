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
    // 네이티브 이미지 드래그(HTML5 dragstart)가 캐러셀의 포인터 드래그를 가로채
    // "넘어가다 마는" 현상을 막는다. preventDefault는 react-multi-carousel의
    // 마우스(mousedown/move) 기반 드래그에는 영향이 없다.
    <div onDragStart={(e) => e.preventDefault()} className="w-full h-full select-none">
      <Carousel containerClass="w-full relative z-0 h-[100%]" responsive={responsive}>
        {children}
      </Carousel>
    </div>
  );
}

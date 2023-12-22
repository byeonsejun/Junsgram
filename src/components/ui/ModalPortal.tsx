import reactDom from 'react-dom'
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
}
export default function ModalPortal({children}: Props) {
  if(typeof window === 'undefined') {
    return null;
  }

  const node = document.getElementById('portal') as Element;

  return reactDom.createPortal(children, node)
}


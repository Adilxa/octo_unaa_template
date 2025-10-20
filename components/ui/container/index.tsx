import clsx from 'clsx';
import { FC, PropsWithChildren } from 'react';

interface IProps extends PropsWithChildren {
  className?: string;
}
const Container: FC<IProps> = ({ className, children }) => {
  return <div className={clsx('mx-auto w-full max-w-[1280px] px-4', className)}>{children}</div>;
};

export default Container;

interface IProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function CustomButton({ children, ...props }: IProps) {
  return <button {...props}>{children}</button>;
}

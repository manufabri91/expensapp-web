interface Props {
  title: string;
  children: React.ReactNode;
}

export const Card = ({ title, children }: Props) => {
  return (
    <div className="rounded-lg bg-white p-4 shadow-md dark:bg-slate-800">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h3>
      {children}
    </div>
  );
};

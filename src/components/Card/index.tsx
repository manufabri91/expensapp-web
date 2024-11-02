interface Props {
  title: string;
  children: React.ReactNode;
}

export const Card = ({ title, children }: Props) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-bold text-gray-800  dark:text-gray-100">
        {title}
      </h3>
      {children}
    </div>
  );
};

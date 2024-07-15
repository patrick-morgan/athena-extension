type ChipProps = {
  text: string;
};

export const Chip = ({ text }: ChipProps) => {
  return (
    <div className="flex justify-center my-1 py-2 px-6 text-base shadow-md bg-slate-100 rounded-sm items-center">
      {text}
    </div>
  );
};

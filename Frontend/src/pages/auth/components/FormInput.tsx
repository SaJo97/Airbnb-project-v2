type FormInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  id: string;
  className?: string;
  errorMsg?: string;
};

const FormInput = ({
  className,
  errorMsg,
  label,
  name,
  id,
  ...rest
}: FormInputProps) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label
        className="mb-1 text-emerald-800 font-medium tracking-wide"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        className="w-full px-3 py-2 rounded-lg border border-emerald-200 focus:border-emerald-500
                   focus:ring-2 focus:ring-emerald-200 outline-none transition
                   placeholder:text-gray-400 bg-white/80"
        id={id}
        name={name}
        {...rest}
      />
      {errorMsg && <p className="text-[firebrick] text-[0.9rem]">{errorMsg}</p>}
    </div>
  );
};
export default FormInput;

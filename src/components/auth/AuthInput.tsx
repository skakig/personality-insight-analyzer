
import { Input } from "@/components/ui/input";
import { AuthInputProps } from "@/types/auth";

export const AuthInput = ({ 
  type, 
  value, 
  onChange, 
  placeholder, 
  minLength,
  error 
}: AuthInputProps) => (
  <div className="space-y-1">
    <Input
      type={type}
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      minLength={minLength}
      className={error ? "border-red-500" : ""}
    />
    {error && (
      <p className="text-sm text-red-500">{error}</p>
    )}
  </div>
);

import { Input } from "@/components/ui/input";

interface AuthInputProps {
  type: "email" | "password";
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  minLength?: number;
}

export const AuthInput = ({ type, value, onChange, placeholder, minLength }: AuthInputProps) => (
  <Input
    type={type}
    required
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    minLength={minLength}
  />
);
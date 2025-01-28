export interface AuthFormProps {
  onSuccess: () => void;
}

export interface AuthInputProps {
  type: "email" | "password";
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  minLength?: number;
  error?: string;
}
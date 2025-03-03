
export interface AuthFormProps {
  mode?: "signin" | "signup" | "reset";
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

export interface PhoneInputFormProps {
  onSubmit: (phone: string) => Promise<void> | void;
  loading?: boolean;
  disabled?: boolean;
  defaultValue?: string;
  className?: string;
}

export interface OtpInputBoxesProps {
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export interface OtpResendTimerProps {
  initialSeconds: number;
  loading?: boolean;
  onResend: () => Promise<void> | void;
  className?: string;
}

export interface CountdownState {
  seconds: number;
  formattedTime: string;
  finished: boolean;
}

export interface TurnstileWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  onLoad?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
  appearance?: "always" | "interaction-only" | "execute";
  disabled?: boolean;
  className?: string;
}

export interface TurnstileWidgetRef {
  execute(): void;
  reset(): void;
  remove(): void;
  getResponse(): string | null;
}

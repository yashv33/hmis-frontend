export type LoginValues = {
  /** Mobile number or email, as entered. */
  identifier: string;
  password: string;
  remember: boolean;
};

export type LoginField = "identifier" | "password";

export type LoginErrors = Partial<Record<LoginField, string>>;

/** What an `onSubmit` handler resolves with. */
export type LoginResult = { ok: true } | { ok: false; message: string };

export type LoginSubmitHandler = (values: LoginValues) => Promise<LoginResult>;

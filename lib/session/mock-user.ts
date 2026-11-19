export type Role = "patient" | "staff";

/** Mock signed-in user — the name and number shown in the account menu (Figma "Account Summary"). */
export const MOCK_USER = {
  name: "Rajesh Kumar",
  phone: "+91 98765 43210",
  role: "patient" as Role,
};

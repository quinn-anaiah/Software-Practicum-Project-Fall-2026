import { demoUsers, type DemoUser } from "./users";

export type AuthenticatedUser = Omit<DemoUser, "password">;

export function authenticate(
  email: string,
  password: string,
): AuthenticatedUser | null {
  const user = demoUsers.find(
    (candidate) =>
      candidate.email === email.trim().toLowerCase() &&
      candidate.password === password,
  );
  if (!user) return null;

  const { password: _password, ...authenticatedUser } = user;
  return authenticatedUser;
}

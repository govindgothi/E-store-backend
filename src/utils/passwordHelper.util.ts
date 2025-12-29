import bcrypt from "bcrypt";

const hashPassword = async (plainPassword: string): Promise<string> => {
  const saltRounds: number = 10;
  const hashedPassword: string = await bcrypt.hash(plainPassword, saltRounds);
  return hashedPassword;
};

const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
   const isMatched = await bcrypt.compare(plainPassword, hashedPassword);
  return isMatched
};

export {
    hashPassword,
    comparePassword
 };
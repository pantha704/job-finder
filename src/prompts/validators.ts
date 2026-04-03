import { ExperienceLevel, LocationScope } from "../types/options";

export const validateExperience = (input: string): boolean | string => {
  const valid: ExperienceLevel[] = ['internship', 'fresher', 'junior', 'mid', 'senior', 'any'];
  if (valid.includes(input as ExperienceLevel)) return true;
  return `Invalid experience level. Must be one of: ${valid.join(', ')}`;
};

export const validateLocationScope = (input: string): boolean | string => {
  const valid: LocationScope[] = ['remote-global', 'remote-india', 'hybrid', 'onsite', 'any'];
  if (valid.includes(input as LocationScope)) return true;
  return `Invalid location scope. Must be one of: ${valid.join(', ')}`;
};

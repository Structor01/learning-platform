// src/types/disc.ts

export type DiscProfileType = 'D' | 'I' | 'S' | 'C';

export interface IDiscTestResult {
  id: number;
  name: string;
  normalized_match_percent: number;
  profile_type: DiscProfileType;
}

export interface IDiscContent {
  title: string;
  content: string;
  profile_type: DiscProfileType;
}

export interface IDiscTestData {
  disc: {
    testes: IDiscTestResult[];
    perfil: string;
  };
  content: IDiscContent[];
}

export interface IDiscProfile {
  type: DiscProfileType;
  name: string;
  description: string;
  percentage: number;
  characteristics: string[];
  strengths: string[];
  improvements: string[];
}

export interface IDiscScores {
  D: number;
  I: number;
  S: number;
  C: number;
}

export interface IDiscPercentages {
  D: number;
  I: number;
  S: number;
  C: number;
}

export interface ITestQuestion {
  id: number;
  section: string;
  text: string;
  options: ITestOption[];
}

export interface ITestOption {
  id: string;
  text: string;
  disc: DiscProfileType | null;
  bigFive: any | null;
  leadership: any | null;
}

export interface ITestResponses {
  [questionIndex: number]: string;
}

export interface ITestResult {
  disc: {
    type: DiscProfileType;
    scores: IDiscScores;
    percentages: IDiscPercentages;
    name: string;
    description: string;
    characteristics: string[];
  };
  bigFive: any;
  leadership: any;
}

export interface IAdjective {
  id: number;
  word: string;
  profile_type: DiscProfileType;
  category: string;
}

export interface IDiscCertificateData {
  userName: string;
  userPhoto?: string;
  profileType: DiscProfileType;
  profileName: string;
  percentage: number;
  date: string;
  characteristics: string[];
}
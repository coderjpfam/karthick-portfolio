export type Contact = {
  phoneNo: string;
  email: string;
  address: string;
};

export type EducationEntry = {
  year: string;
  degree: string;
  university: string;
};

export type ExperienceEntry = {
  year: string;
  name: string;
  location: string;
  role: string;
  responsibilities: string[];
};

export type Certification = {
  issuerName: string;
  issuedOn: string;
  expiresAt: string;
  courseName: string;
  url: string;
};

export type PortfolioData = {
  name: string;
  role: string;
  about: string;
  contact: Contact;
  education: EducationEntry[];
  skills: string[];
  experience: ExperienceEntry[];
  certifications: Certification[];
};

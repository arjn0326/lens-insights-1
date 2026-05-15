import lensData from "../../public/data/lens.json";

export interface CertificationByGradeRow {
  grade: string;
  certified: number;
  outOfField: number;
  uncertified: number;
}

export interface VacancyBySubjectRow {
  subject: string;
  vacancies: number;
}

export interface RetentionByPathwayRow {
  year: string;
  undergraduate: number;
  postBacc: number;
}

export interface WorkforceHeadlines {
  totalTeachers: number;
  totalStudents: number;
  teachersOfColorPct: number;
  studentsOfColorPct: number;
  economicallyDisadvantagedPct: number;
  overallRetentionPct: number;
  totalVacancies: number;
  schoolsReportingVacanciesPct: number;
}

export interface WorkforceSnapshot {
  source: string;
  certificationByGrade: CertificationByGradeRow[];
  vacanciesBySubject: VacancyBySubjectRow[];
  retentionByPathway: RetentionByPathwayRow[];
  headlines: WorkforceHeadlines;
}

type LensRoot = {
  workforceSnapshot: WorkforceSnapshot;
};

const workforceSnapshot = (lensData as LensRoot).workforceSnapshot;

export const certificationByGrade = workforceSnapshot.certificationByGrade;
export const vacanciesBySubject = workforceSnapshot.vacanciesBySubject;
export const retentionByPathway = workforceSnapshot.retentionByPathway;
export const headlines = workforceSnapshot.headlines;

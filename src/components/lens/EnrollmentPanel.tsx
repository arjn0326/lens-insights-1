import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface GradesK12 {
  kindergarten: number;
  grade_1: number;
  grade_2: number;
  grade_3: number;
  grade_4: number;
  grade_5: number;
  grade_6: number;
  grade_7: number;
  grade_8: number;
  grade_9: number;
  grade_10: number;
  grade_11: number;
  grade_12: number;
}

interface RaceCounts {
  american_indian: number;
  asian: number;
  black: number;
  hispanic: number;
  hawaiian_pacific: number;
  white: number;
  multiple_races: number;
}

export interface EnrollmentData {
  parish_name: string;
  schools_reporting: number;
  total_enrollment: number;
  pct_of_state: number;
  students_per_school: number;
  gender: { pct_female: number; pct_male: number; female_count: number; male_count: number };
  race_ethnicity_counts: RaceCounts;
  race_ethnicity_pct: RaceCounts;
  pct_economically_disadvantaged: number;
  grades_k12: GradesK12;
  k12_total: number;
}

interface Props {
  data: EnrollmentData | null;
  /** Hide LDOE report date lines on parish full report */
  hideSourceDate?: boolean;
}

export const RACE_COLORS: Record<string, string> = {
  white: "#185FA5",
  black: "#A32D2D",
  hispanic: "#B07D00",
  multiple_races: "#3B6D11",
  asian: "#6B3FA0",
  american_indian: "#C05C00",
  hawaiian_pacific: "#0F6E56",
};

export const RACE_LABELS: Record<string, string> = {
  white: "White",
  black: "Black",
  hispanic: "Hispanic",
  multiple_races: "Multiracial",
  asian: "Asian",
  american_indian: "Am. Indian",
  hawaiian_pacific: "Hawaiian/PI",
};

export function EnrollmentPanel({ data, hideSourceDate }: Props) {
  if (!data) return null;

  const gradeData = [
    { grade: "K", students: data.grades_k12.kindergarten },
    { grade: "1", students: data.grades_k12.grade_1 },
    { grade: "2", students: data.grades_k12.grade_2 },
    { grade: "3", students: data.grades_k12.grade_3 },
    { grade: "4", students: data.grades_k12.grade_4 },
    { grade: "5", students: data.grades_k12.grade_5 },
    { grade: "6", students: data.grades_k12.grade_6 },
    { grade: "7", students: data.grades_k12.grade_7 },
    { grade: "8", students: data.grades_k12.grade_8 },
    { grade: "9", students: data.grades_k12.grade_9 },
    { grade: "10", students: data.grades_k12.grade_10 },
    { grade: "11", students: data.grades_k12.grade_11 },
    { grade: "12", students: data.grades_k12.grade_12 },
  ];

  const raceData = Object.entries(data.race_ethnicity_counts)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({
      name: RACE_LABELS[key] ?? key,
      value,
      pct: data.race_ethnicity_pct[key as keyof RaceCounts],
      color: RACE_COLORS[key] ?? "#888780",
    }));

  return (
    <div className="mb-8 rounded-xl border border-border bg-[var(--surface-elevated)] p-6">
      <div className="mb-5">
        {!hideSourceDate && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            LDOE · February 1, 2026 · Real enrollment data
          </p>
        )}
        <h2 className={`${hideSourceDate ? "" : "mt-0.5"} text-[17px] font-semibold text-foreground`}>
          Student Enrollment Overview
        </h2>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-[var(--surface)] p-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Total students</p>
          <p className="mt-1 text-[22px] font-semibold text-foreground">
            {data.total_enrollment.toLocaleString()}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)]">{data.pct_of_state}% of Louisiana</p>
        </div>
        <div className="rounded-lg bg-[var(--surface)] p-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Schools</p>
          <p className="mt-1 text-[22px] font-semibold text-foreground">{data.schools_reporting}</p>
          <p className="text-[11px] text-[var(--text-secondary)]">reporting sites</p>
        </div>
        <div className="rounded-lg bg-[var(--surface)] p-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Students / school</p>
          <p className="mt-1 text-[22px] font-semibold text-foreground">{data.students_per_school}</p>
          <p className="text-[11px] text-[var(--text-secondary)]">avg per site</p>
        </div>
        <div className="rounded-lg bg-[var(--surface)] p-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Econ. disadvantaged</p>
          <p className="mt-1 text-[22px] font-semibold text-foreground">
            {data.pct_economically_disadvantaged}%
          </p>
          <p className="text-[11px] text-[var(--text-secondary)]">of enrolled students</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Gender split
        </p>
        <div className="flex h-6 w-full overflow-hidden rounded-full">
          <div
            style={{ width: `${data.gender.pct_female}%`, background: "#185FA5" }}
            className="flex items-center justify-center text-[10px] font-semibold text-white"
          >
            {data.gender.pct_female}% F
          </div>
          <div
            style={{ width: `${data.gender.pct_male}%`, background: "#3B6D11" }}
            className="flex items-center justify-center text-[10px] font-semibold text-white"
          >
            {data.gender.pct_male}% M
          </div>
        </div>
        <div className="mt-1.5 flex gap-4 text-[11px] text-[var(--text-secondary)]">
          <span>{data.gender.female_count?.toLocaleString()} female students</span>
          <span>{data.gender.male_count?.toLocaleString()} male students</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Students by grade (K–12)
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={gradeData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(136,135,128,0.15)" />
              <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(v: number) => [v.toLocaleString(), "Students"]}
                labelFormatter={(l) => `Grade ${l}`}
              />
              <Bar dataKey="students" fill="#185FA5" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Students by race / ethnicity
          </p>
          <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1">
            {raceData.map((r) => (
              <span key={r.name} className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: r.color }} />
                {r.name} ({r.pct}%)
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie
                data={raceData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                dataKey="value"
                paddingAngle={2}
              >
                {raceData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number, name: string) => [v.toLocaleString(), name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {!hideSourceDate && (
        <p className="mt-4 text-[11px] text-[var(--text-muted)]">
          Source: LDOE Multiple Statistics by School System · February 1, 2026 · Public schools only
        </p>
      )}
    </div>
  );
}

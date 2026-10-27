"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import {
  registrationCopy,
  registrationConstants,
  universities,
  programmes,
  departments,
  yearOptions,
  semesterOptions,
} from "@/data/registration";
import { academicSchema, type AcademicValues } from "@/lib/auth/schemas";
import { useRegistration } from "@/components/features/auth/RegistrationProvider";
import { RegisterStepFrame } from "@/components/features/auth/RegisterStepFrame";
import { SelectField } from "@/components/ui/SelectField";
import { Button } from "@/components/ui/button";

export function AcademicStep() {
  const { state, saveData, goToStep } = useRegistration();

  const graduationYears = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: { value: string; label: string }[] = [];
    for (let i = 0; i <= registrationConstants.graduationSpan; i++) {
      const y = String(currentYear + i);
      years.push({ value: y, label: y });
    }
    return years;
  }, []);

  const programmeOptions = React.useMemo(
    () => programmes.map((p) => ({ value: p, label: p })),
    []
  );

  const yearOptionsList = React.useMemo(
    () => yearOptions.map((y) => ({ value: y, label: y })),
    []
  );

  const semesterOptionsList = React.useMemo(
    () => semesterOptions.map((s) => ({ value: s, label: s })),
    []
  );

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<AcademicValues>({
    resolver: zodResolver(academicSchema),
    mode: "onTouched",
    defaultValues: {
      university: state.data.university ?? universities[0].value,
      programme: state.data.programme ?? "",
      department: state.data.department ?? "",
      year: state.data.year ?? "",
      semester: state.data.semester ?? "",
      graduationYear: state.data.graduationYear ?? "",
    },
  });

  const onSubmit = (values: AcademicValues) => {
    saveData(values);
    goToStep(3);
  };

  const handleBack = () => {
    saveData(getValues());
    goToStep(1);
  };

  return (
    <RegisterStepFrame
      step={2}
      title={registrationCopy.academic.title}
      subtitle={registrationCopy.academic.subtitle}
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
        {/* Full width: University (single option preselected) */}
        <SelectField
          label={registrationCopy.academic.fields.university.label}
          required
          options={universities}
          error={errors.university?.message}
          {...register("university")}
        />

        {/* Programme and Branch / Department side by side */}
        <div className="grid gap-2.5 sm:grid-cols-2">
          <SelectField
            label={registrationCopy.academic.fields.programme.label}
            placeholder={
              registrationCopy.academic.fields.programme.placeholder
            }
            required
            options={programmeOptions}
            error={errors.programme?.message}
            {...register("programme")}
          />

          <SelectField
            label={registrationCopy.academic.fields.department.label}
            placeholder={
              registrationCopy.academic.fields.department.placeholder
            }
            required
            options={departments}
            error={errors.department?.message}
            {...register("department")}
          />
        </div>

        {/* Current Year and Current Semester side by side */}
        <div className="grid gap-2.5 sm:grid-cols-2">
          <SelectField
            label={registrationCopy.academic.fields.year.label}
            placeholder={registrationCopy.academic.fields.year.placeholder}
            required
            options={yearOptionsList}
            error={errors.year?.message}
            {...register("year")}
          />

          <SelectField
            label={registrationCopy.academic.fields.semester.label}
            placeholder={registrationCopy.academic.fields.semester.placeholder}
            required
            options={semesterOptionsList}
            error={errors.semester?.message}
            {...register("semester")}
          />
        </div>

        {/* Expected Graduation Year at half width */}
        <div className="grid gap-2.5 sm:grid-cols-2">
          <SelectField
            label={registrationCopy.academic.fields.graduationYear.label}
            placeholder={
              registrationCopy.academic.fields.graduationYear.placeholder
            }
            required
            options={graduationYears}
            error={errors.graduationYear?.message}
            {...register("graduationYear")}
          />
        </div>

        {/* Navigation Buttons: Back and Next in grid-cols-[1fr_2fr] */}
        <div className="grid grid-cols-[1fr_2fr] gap-2.5 pt-1.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="h-10 text-[13.5px] font-medium"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
            <span>Back</span>
          </Button>

          <Button
            type="submit"
            variant="primary"
            withArrow
            disabled={isSubmitting}
            className="h-10 text-[13.5px] font-semibold"
          >
            Next
          </Button>
        </div>
      </form>
    </RegisterStepFrame>
  );
}

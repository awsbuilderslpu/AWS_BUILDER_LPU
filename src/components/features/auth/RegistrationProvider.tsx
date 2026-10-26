"use client";

import * as React from "react";
import type {
  BasicInfoValues,
  AcademicValues,
  InterestsValues,
} from "@/lib/auth/schemas";

export type RegistrationStage = "welcome" | "steps" | "verify" | "success";
export type RegistrationStepNumber = 1 | 2 | 3 | 4;

export type RegistrationData = Partial<
  BasicInfoValues & AcademicValues & InterestsValues
>;

export interface RegistrationState {
  stage: RegistrationStage;
  step: RegistrationStepNumber;
  data: RegistrationData;
  focusEmail: boolean;
}

const initialState: RegistrationState = {
  stage: "welcome",
  step: 1,
  data: {
    countryCode: "+91",
    requestedRole: "student",
    interests: [],
  },
  focusEmail: false,
};

type RegistrationAction =
  | { type: "START_STEPS" }
  | { type: "GO_TO_STEP"; step: RegistrationStepNumber }
  | { type: "SAVE_DATA"; partial: RegistrationData }
  | { type: "MARK_SUBMITTED" }
  | { type: "CHANGE_EMAIL" }
  | { type: "MARK_VERIFIED" }
  | { type: "RESET" };

function registrationReducer(
  state: RegistrationState,
  action: RegistrationAction
): RegistrationState {
  switch (action.type) {
    case "START_STEPS":
      return {
        ...state,
        stage: "steps",
        step: 1,
        focusEmail: false,
      };
    case "GO_TO_STEP":
      return {
        ...state,
        stage: "steps",
        step: action.step,
        focusEmail: false,
      };
    case "SAVE_DATA":
      return {
        ...state,
        data: {
          ...state.data,
          ...action.partial,
        },
        focusEmail: false,
      };
    case "MARK_SUBMITTED": {
      // Wipes password and confirmPassword from state
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, confirmPassword, ...safeData } = state.data;
      return {
        ...state,
        stage: "verify",
        data: safeData,
        focusEmail: false,
      };
    }
    case "CHANGE_EMAIL":
      return {
        ...state,
        stage: "steps",
        step: 1,
        focusEmail: true,
      };
    case "MARK_VERIFIED":
      return {
        ...state,
        stage: "success",
        focusEmail: false,
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export interface RegistrationContextValue {
  state: RegistrationState;
  startSteps: () => void;
  goToStep: (step: RegistrationStepNumber) => void;
  saveData: (partial: RegistrationData) => void;
  markSubmitted: () => void;
  changeEmail: () => void;
  markVerified: () => void;
  reset: () => void;
}

const RegistrationContext =
  React.createContext<RegistrationContextValue | null>(null);

export function RegistrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = React.useReducer(
    registrationReducer,
    initialState
  );

  const startSteps = React.useCallback(() => {
    dispatch({ type: "START_STEPS" });
  }, []);

  const goToStep = React.useCallback((step: RegistrationStepNumber) => {
    dispatch({ type: "GO_TO_STEP", step });
  }, []);

  const saveData = React.useCallback((partial: RegistrationData) => {
    dispatch({ type: "SAVE_DATA", partial });
  }, []);

  const markSubmitted = React.useCallback(() => {
    dispatch({ type: "MARK_SUBMITTED" });
  }, []);

  const changeEmail = React.useCallback(() => {
    dispatch({ type: "CHANGE_EMAIL" });
  }, []);

  const markVerified = React.useCallback(() => {
    dispatch({ type: "MARK_VERIFIED" });
  }, []);

  const reset = React.useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const value = React.useMemo<RegistrationContextValue>(
    () => ({
      state,
      startSteps,
      goToStep,
      saveData,
      markSubmitted,
      changeEmail,
      markVerified,
      reset,
    }),
    [
      state,
      startSteps,
      goToStep,
      saveData,
      markSubmitted,
      changeEmail,
      markVerified,
      reset,
    ]
  );

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const ctx = React.useContext(RegistrationContext);
  if (!ctx) {
    throw new Error(
      "useRegistration must be used within a RegistrationProvider"
    );
  }
  return ctx;
}

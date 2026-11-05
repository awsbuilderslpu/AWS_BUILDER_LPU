import { basicInfoSchema } from "@/lib/auth/schemas";
import { zodResolver } from "@hookform/resolvers/zod";

async function test() {
  const resolver = zodResolver(basicInfoSchema);

  const invalidData = {
    firstName: "Arfaa",
  lastName: "Taj",
    email: "arfaa123@gmail.com",
    countryCode: "+91" as const,
    phone: "8371889693",
    registrationNumber: "12313447",
    dateOfBirth: "2026-10-07",
    gender: "Female" as const,
    password: "Password123!",
    confirmPassword: "Password123!",
    termsAccepted: true as const,
  };

const resolverResult = await resolver(invalidData, undefined, {
  fields: {},
  criteriaMode: "firstError",
  shouldUseNativeValidation: false,
});

console.log("Resolver errors on 2026 dob:", JSON.stringify(resolverResult.errors, null, 2));

const validData = {
  ...invalidData,
  dateOfBirth: "2003-05-15",
};

const validResult = await resolver(validData, undefined, {
  fields: {},
  criteriaMode: "firstError",
  shouldUseNativeValidation: false,
});

console.log("Resolver on valid data - errors count:", Object.keys(validResult.errors).length);
console.log("Resolver on valid data - values present:", Boolean(validResult.values.firstName));
}

void test();

import { validateProspect } from "../prospect-helpers";

describe("prospect creation validation", () => {
  test("rejects a blank company name", () => {
    const result = validateProspect({
      companyName: "",
      roleTitle: "Software Engineer",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Company name is required");
  });

  test("rejects a blank role title", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Role title is required");
  });

  test("accepts a valid prospect without salary", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts a valid prospect with a known salary", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      salary: "$120,000",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts a salary range", () => {
    const result = validateProspect({
      companyName: "Meta",
      roleTitle: "Product Manager",
      salary: "$90k-$110k",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts an approximate salary", () => {
    const result = validateProspect({
      companyName: "Apple",
      roleTitle: "Designer",
      salary: "~$100k",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts an empty salary string", () => {
    const result = validateProspect({
      companyName: "Netflix",
      roleTitle: "Engineer",
      salary: "",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts null salary", () => {
    const result = validateProspect({
      companyName: "Netflix",
      roleTitle: "Engineer",
      salary: null,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("rejects salary exceeding 100 characters", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      salary: "A".repeat(101),
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Salary must be 100 characters or less");
  });

  test("rejects non-string salary", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      salary: 120000,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Salary must be a string");
  });

  test("accepts salary at exactly 100 characters", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      salary: "A".repeat(100),
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe("date field validation", () => {
  test("accepts a valid update date", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Engineer",
      updateDate: "2026-03-10",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts a valid important date", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Engineer",
      importantDate: "2026-04-15",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts both dates together", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Engineer",
      updateDate: "2026-03-10",
      importantDate: "2026-04-15",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts empty update date", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Engineer",
      updateDate: "",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts null update date", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Engineer",
      updateDate: null,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts empty important date", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Engineer",
      importantDate: "",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts null important date", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Engineer",
      importantDate: null,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("rejects invalid update date string", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Engineer",
      updateDate: "not-a-date",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Update date must be a valid date");
  });

  test("rejects invalid important date string", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Engineer",
      importantDate: "xyz",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Important date must be a valid date");
  });

  test("rejects non-string update date", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Engineer",
      updateDate: 12345,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Update date must be a string");
  });

  test("rejects non-string important date", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Engineer",
      importantDate: true,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Important date must be a string");
  });

  test("accepts a past important date (validation allows it, UI warns)", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Engineer",
      importantDate: "2020-01-01",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts prospect with no date fields at all", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Engineer",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

import { describe, it, expect } from "vitest"
import {
  LoginSchema,
  RegisterSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "@/lib/validations/auth.schema"

describe("LoginSchema", () => {
  it("accepts valid credentials", () => {
    const result = LoginSchema.safeParse({ email: "user@example.com", password: "secret" })
    expect(result.success).toBe(true)
  })

  it("rejects invalid email", () => {
    const result = LoginSchema.safeParse({ email: "not-an-email", password: "secret" })
    expect(result.success).toBe(false)
  })

  it("rejects empty password", () => {
    const result = LoginSchema.safeParse({ email: "user@example.com", password: "" })
    expect(result.success).toBe(false)
  })
})

describe("RegisterSchema", () => {
  it("accepts valid registration data", () => {
    const result = RegisterSchema.safeParse({
      name: "João Silva",
      email: "joao@example.com",
      password: "Password123",
      confirmPassword: "Password123",
    })
    expect(result.success).toBe(true)
  })

  it("rejects mismatched passwords", () => {
    const result = RegisterSchema.safeParse({
      name: "João Silva",
      email: "joao@example.com",
      password: "Password123",
      confirmPassword: "Different123",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].path).toContain("confirmPassword")
    }
  })

  it("rejects short password", () => {
    const result = RegisterSchema.safeParse({
      name: "João",
      email: "joao@example.com",
      password: "short",
      confirmPassword: "short",
    })
    expect(result.success).toBe(false)
  })
})

describe("ForgotPasswordSchema", () => {
  it("accepts valid email", () => {
    const result = ForgotPasswordSchema.safeParse({ email: "user@example.com" })
    expect(result.success).toBe(true)
  })

  it("rejects invalid email", () => {
    const result = ForgotPasswordSchema.safeParse({ email: "bad" })
    expect(result.success).toBe(false)
  })
})

describe("ResetPasswordSchema", () => {
  it("accepts valid reset data", () => {
    const result = ResetPasswordSchema.safeParse({
      token: "reset-token-123",
      password: "NewPass123!",
      confirmPassword: "NewPass123!",
    })
    expect(result.success).toBe(true)
  })

  it("rejects mismatched passwords", () => {
    const result = ResetPasswordSchema.safeParse({
      token: "token",
      password: "NewPass123!",
      confirmPassword: "Different!",
    })
    expect(result.success).toBe(false)
  })
})

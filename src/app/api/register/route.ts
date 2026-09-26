import { NextRequest } from "next/server";
import { registerSchema } from "@/lib/validation/auth.schema";
import { AuthService } from "@/server/services/auth.service";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const result = registerSchema.safeParse(json);

    if (!result.success) {
      return apiError("Validation Error", 400, result.error.errors);
    }

    const user = await AuthService.registerUser(result.data);
    return apiSuccess({ success: true, user }, 201);
  } catch (error: any) {
    if (error.message === "EMAIL_EXISTS") {
      return apiError("Email is already registered", 409);
    }
    return apiError("Internal server error during registration", 500);
  }
}

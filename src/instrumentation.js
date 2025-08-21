import { connectMade } from "./lib/mongodb";

export async function register() {
  try {
    await connectMade();
    console.log("code touch register");
  } catch (err) {
    console.error("Failed to connect in register():", err);
  }
}

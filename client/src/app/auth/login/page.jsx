/** @format */
"use client";
import { userLogin } from "@/redux/middleware/user";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
function Page() {
  const dispatch = useDispatch();
  const router = useRouter();
  const login = () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    dispatch(userLogin({ email, password }, router));
  };

  return (
    <>
      <div
        className="flex justify-center items-center min-h-screen 
       text-sm p-3"
      >
        <div className="flex flex-col w-96">
          <h1 className=" text-3xl font-semibold">Login</h1>
          <div className=" font-bold mt-5">Email</div>
          <input
            className=" p-3 bg-[#F3F4F6] rounded-lg "
            placeholder="chairin@mail.com"
            id="email"
            type="email"
          ></input>

          <div className=" font-bold mt-5">Password</div>
          <input
            className=" p-3 bg-[#F3F4F6] rounded-lg "
            placeholder="******"
            id="password"
            type="password"
          ></input>
          <div className=" mt-4 text-xs ">
            Lost your password?{" "}
            <Link
              href="/auth/forgot-password"
              className="text-[#4F46E5] font-bold"
            >
              Forgot password
            </Link>
          </div>
          <div className=" mt-4 text-xs ">
            Create an account?{" "}
            <Link href="/auth/register" className="text-[#4F46E5] font-bold">
              Register
            </Link>
          </div>
          <button
            className="  rounded-lg mt-2 text-white bg-[#4F46E5] h-16"
            onClick={login}
          >
            Login
          </button>
        </div>
      </div>
    </>
  );
}
export default Page;

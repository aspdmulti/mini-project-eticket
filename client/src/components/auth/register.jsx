/** @format */
"use client";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Center,
  Heading,
  Flex,
  Button,
  useToast,
  RadioGroup,
  Stack,
  Radio,
} from "@chakra-ui/react";
import * as Yup from "yup";
import YupPassword from "yup-password";
import { useFormik } from "formik";
import Link from "next/link";
import { useEffect, useState } from "react";
import { axiosInstance } from "@/axios/axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

function RegisterComponent() {
  const [gender, setGender] = useState("male");
  const router = useRouter();

  YupPassword(Yup);
  const toast = useToast();
  const initialValues = {
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone_number: "",
    gender: "male",
    ref_number: "",
  };

  const inputFormik = () => {
    formik.setValues({
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      confirmPassword: document.getElementById("confirmPassword").value,
      name: document.getElementById("name").value,
      phone_number: document.getElementById("phone_number").value,
      gender: gender,
      referral_number: document.getElementById("ref_number").value,
    });
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object().shape({
      email: Yup.string().required().email(),
      name: Yup.string().required().min(3),
      phone_number: Yup.string(),
      gender: Yup.string(),
      referral_number: Yup.string(),
      password: Yup.string().min(5).minNumbers(1).required().minUppercase(1),
      confirmPassword: Yup.string()
        .required()
        .oneOf([Yup.ref("password")], "password does not match"),
    }),
    async onSubmit(values) {
      try {
        const { email, password, name, phone_number, gender, referral_number } =
          values;
        const res = await axiosInstance().post("/users/", {
          email,
          password,
          name,
          gender,
          phone_number,
          referral_number,
        });
        Swal.fire({
          title: "Success!",
          text: res.data.message,
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
        }).then(function () {
          router.push("/auth/login");
        });
      } catch (error) {
        toast({
          title: "Error",
          position: "top",

          description: error?.response?.data?.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  useEffect(() => {
    const { email, password, confirmPassword, name } = formik.values;
    if (email && password && confirmPassword && name) formik.handleSubmit();
  }, [formik.values]);
  return (
    <>
      <Flex className=" max-w-96 w-full flex-col gap-2 ">
        <Heading> Register</Heading>
        <FormControl className="flex flex-col gap-2">
          <div>
            <FormLabel>Name</FormLabel>
            <Input type="text" id="name" />
            <FormHelperText color={"red"}>{formik.errors.name}</FormHelperText>
          </div>
          <div>
            <FormLabel>Email address</FormLabel>
            <Input type="email" id="email" />
            <FormHelperText color={"red"}>{formik.errors.email}</FormHelperText>
          </div>
          <div>
            <FormLabel>Gender</FormLabel>
            <RadioGroup onChange={setGender} value={gender}>
              <Stack direction="row">
                <Radio value="male">Male</Radio>
                <Radio value="female">Female</Radio>
              </Stack>
            </RadioGroup>
          </div>
          <div>
            <FormLabel>Phone Number</FormLabel>
            <Input type="text" id="phone_number" />
          </div>
          <div>
            <FormLabel>Password </FormLabel>
            <Input type="password" id="password" />
            <FormHelperText color={"red"}>
              {formik.errors.password}
            </FormHelperText>
          </div>
          <div>
            <FormLabel>Confirm Password </FormLabel>
            <Input type="password" id="confirmPassword" />
            <FormHelperText color={"red"}>
              {formik.errors.confirmPassword}
            </FormHelperText>
          </div>
          <div>
            <FormLabel>Referral Number</FormLabel>
            <Input type="text" id="ref_number" />
          </div>
        </FormControl>
        <div>
          Have an account ?{" "}
          <Link href="/auth/login" className="text-[#4F46E5] font-bold">
            Login
          </Link>
        </div>
        <Button type="button" colorScheme={"facebook"} onClick={inputFormik}>
          Register
        </Button>
      </Flex>
    </>
  );
}
export default RegisterComponent;

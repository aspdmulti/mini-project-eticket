/** @format */
import { Response, Request, NextFunction } from "express";
import { prisma, secretKey } from ".."; //accessing model
import { Prisma } from "@prisma/client"; // accessing interface/types
import { ReqUser } from "../middlewares/auth-middleware";

import { genSalt, hash, compare } from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import { mailer, transport } from "../lib/nodemailer";
import mustache from "mustache";
import fs from "fs";
type TUser = {
  email: string;
};

const template = fs
  .readFileSync(__dirname + "/../templates/verify.html")
  .toString();

const forgotPass = fs
  .readFileSync(__dirname + "/../templates/forgotPass.html")
  .toString();

export const userController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name, gender, phone_number, referral_number } =
        req.body;
      const salt = await genSalt(10);

      const hashedPassword = await hash(password, salt);

      const newUser: Prisma.usersCreateInput = {
        email,
        password: hashedPassword,
        name,
        gender,
        phone_number,
      };

      const checkUser = await prisma.users.findUnique({
        where: {
          email,
        },
      });

      if (checkUser?.id) throw Error("user already exist");

      if (referral_number.length > 0) {
        const checkRefNum = await prisma.users.findUnique({
          where: {
            referral_number,
          },
        });
        if (checkRefNum?.id) {
          const currentDate = new Date();
          let nextDate = new Date();
          let nextMonth = currentDate.getMonth() + 3;
          let nextYear = currentDate.getFullYear();
          if (nextMonth > 11) {
            nextMonth -= 12;
            nextYear++;
          }
          nextDate.setMonth(nextMonth);
          nextDate.setFullYear(nextYear);
          const pointIncrease: Prisma.usersUpdateInput = {
            points: checkRefNum.points + 10000,
            expired_at: new Date(nextDate),
          };

          await prisma.users.create({
            data: newUser,
          });
          await prisma.users.update({
            data: pointIncrease,
            where: {
              id: checkRefNum.id,
            },
          });
          const getCoupon: Prisma.usersUpdateInput = {
            register_coupon: true,
          };
          await prisma.users.update({
            data: getCoupon,
            where: {
              email: String(email),
            },
          });
        } else throw Error("referral number not valid");
      } else {
        await prisma.users.create({
          data: newUser,
        });
      }

      const token = sign({ email }, secretKey, {
        expiresIn: "1hr",
      });

      const rendered = mustache.render(template, {
        email,
        name,
        verify_url: process.env.verifyURL + token,
      });

      mailer({
        to: email,
        subject: "Verify Account",
        text: "",
        html: rendered,
      });

      res.send({
        success: true,
        message: "register success, please verify your account",
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.query;

      const user = await prisma.users.findUnique({
        where: {
          email: String(email),
        },
      });
      if (!user) throw Error("invalid email/password");
      if (!user.isVerified) throw Error("email not verified");
      const checkPassword = await compare(String(password), user.password);
      const resUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        gender: user.gender,
        role: user.role,
        wallet: user.wallet,
        points: user.points,
        expired_at: user.expired_at,
      };
      if (checkPassword) {
        const token = sign(resUser, secretKey, {
          expiresIn: "8hr",
        });

        return res.send({
          success: true,
          result: resUser,
          token,
        });
      }
      throw Error("email/password not valid");
    } catch (error) {
      next(error);
    }
  },
  async forgotPassword(req: ReqUser, res: Response, next: NextFunction) {
    try {
      const { password } = req.body;

      const salt = await genSalt(10);

      const hashedPassword = await hash(password, salt);
      const userEditPassword: Prisma.usersUpdateInput = {
        password: hashedPassword,
      };
      await prisma.users.update({
        data: userEditPassword,
        where: {
          email: String(req.user?.email),
        },
      });
      res.send({
        success: true,
        message: "berhasil merubah password",
      });
    } catch (error) {
      next(error);
    }
  },
  async keepLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { authorization } = req.headers;

      if (!authorization) throw Error("unauthorized");

      const verifyUser = verify(authorization, secretKey) as TUser;
      const checkUser = await prisma.users.findUnique({
        select: {
          id: true,
          email: true,
          name: true,
          gender: true,
          role: true,
          wallet: true,
          points: true,
          expired_at: true,
        },
        where: {
          email: verifyUser.email,
        },
      });
      if (!checkUser) throw Error("unauthorized");

      const token = sign(checkUser, secretKey, {
        expiresIn: "8hr",
      });
      res.send({
        success: true,
        result: checkUser,
        token,
      });
    } catch (error) {
      next(error);
    }
  },
  async sendMail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.query;

      const checkUser = await prisma.users.findUnique({
        where: {
          email: String(email),
        },
      });
      if (!checkUser) throw Error("email is not valid, please check again");
      const token = sign({ email }, secretKey, {
        expiresIn: "1hr",
      });
      const rendered = mustache.render(forgotPass, {
        email,
        name: checkUser.name,
        verify_url: process.env.forgotPassURL + token,
      });

      mailer({
        to: String(email),
        subject: "Create new password",
        text: "",
        html: rendered,
      });

      res.send({
        message: "password changer mail has been sent to your email",
      });
    } catch (error) {
      next(error);
    }
  },
  async verifyEmail(req: ReqUser, res: Response, next: NextFunction) {
    try {
      const { user } = req;
      const verif: Prisma.usersUpdateInput = {
        isVerified: true,
      };
      if (user?.isVerified) throw Error("user already verified");
      await prisma.users.update({
        data: verif,
        where: {
          id: user?.id,
        },
      });
      const checkCoupon = await prisma.users.findUnique({
        where: {
          id: user?.id,
        },
      });
      if (checkCoupon?.register_coupon) {
        const currentDate = new Date();
        let nextDate = new Date();
        let nextMonth = currentDate.getMonth() + 3;
        let nextYear = currentDate.getFullYear();
        if (nextMonth > 11) {
          nextMonth -= 12;
          nextYear++;
        }
        nextDate.setMonth(nextMonth);
        nextDate.setFullYear(nextYear);
        const coupon: Prisma.couponsCreateInput = {
          amount: 10,
          created_at: currentDate,
          expired_at: new Date(nextDate),
          user: {
            connect: {
              id: user?.id,
            },
          },
        };
        await prisma.coupons.create({
          data: coupon,
        });
      }
      res.send({
        message: "success",
      });
    } catch (error) {
      next(error);
    }
  },
};

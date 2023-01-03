import { z } from "zod";

import { router, publicProcedure } from "../trpc";

export const exampleRouter = router({
  hello: publicProcedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),
  getAllActiveReferrals: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.referral.findMany({
      where: {
        isActive: true,
      },
    });
  }),
  getReferallById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const thisReferral = await ctx.prisma.referral.findUnique({
        select: {
          id: true,
          isActive: true,
          name: true,
          referralLinkCanBeReused: true,
        },
        where: {
          id: input.id,
        },
      });
      var referralLinks;
      if (thisReferral && thisReferral.referralLinkCanBeReused === true) {
        referralLinks = await ctx.prisma.referralLink.findMany({
          select: {
            id: true,
            referralUrl: true,
          },
          where: {
            referralId: input.id,
          },
        });
      } else {
        referralLinks = await ctx.prisma.referralLink.findMany({
          select: {
            id: true,
            referralUrl: true,
          },
          where: {
            referralId: input.id,
            isUsed: false,
          },
        });
      }
      const thisRandomReferralLink =
        referralLinks[Math.floor(Math.random() * referralLinks.length)];

      if (!thisReferral || thisReferral.isActive === false) {
        throw new Error("Referral not found or not active");
      }
      return { referral: thisReferral, referralLink: thisRandomReferralLink };
    }),
  createReferralLink: publicProcedure
    .input(z.object({ id: z.string(), url: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const referralLink = await ctx.prisma.referralLink.create({
        data: {
          referralUrl: input.url,
          referral: {
            connect: {
              id: input.id,
            },
          },
          isUsed: false,
        },
      });
      return referralLink;
    }),
  setReferralLinkUsed: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const referralLink = await ctx.prisma.referralLink.update({
        where: {
          id: input.id,
        },
        data: {
          isUsed: true,
        },
      });
      return referralLink;
    }),
});

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { trpc } from "../../utils/trpc";
import { toast, Toaster } from "react-hot-toast";

const ReferralPage: NextPage = () => {
  const router = useRouter();
  const { data, isLoading, error } = trpc.example.getReferallById.useQuery(
    { id: router.query.id as string },
    { enabled: router.query.id !== undefined }
  );

  return (
    <>
      <Head>
        <title>Referral Lottery</title>
        <meta
          name="description"
          content="Referral Lottery made by Arian Joyandeh"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster />
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Referral for{" "}
            <span className="text-[hsl(280,100%,70%)]">
              {data?.referral.name ?? "..."}
            </span>
          </h1>
          {isLoading && <div className="text-4xl text-white">Loading...</div>}
          {error && <div className="text-4xl text-white">Error</div>}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 gap-4 md:gap-8">
              {data.referralLink ? (
                <Card
                  title={`Referral for ${data.referral.name}`}
                  referralLink={data.referralLink!.referralUrl}
                  referralLinkId={data.referralLink!.id}
                  referralLinkCanBeReused={
                    data.referral!.referralLinkCanBeReused
                  }
                />
              ) : (
                <div className="flex max-w-xs flex-col gap-4 overflow-hidden rounded-xl bg-white/10 p-4 text-white">
                  <h3 className="text-2xl font-bold">
                    No links for {data.referral.name} 😢
                  </h3>
                </div>
              )}
              <Form
                referralId={data.referral.id}
                referralName={data.referral.name}
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
};

const Form = ({
  referralId,
  referralName,
}: {
  referralId: string;
  referralName: string;
}) => {
  const addLinkMutation = trpc.example.createReferralLink.useMutation();

  const [referralLink, setReferralLink] = useState<string>("");

  const handleClick = () => {
    if (referralLink) {
      addLinkMutation
        .mutateAsync({
          url: referralLink,
          id: referralId,
        })
        .then((res) => {
          toast.success(
            `Succesfully added a referral link for ${referralName}`
          );
        })
        .catch((err) =>
          toast.error(`Error adding referral link for ${referralName}`)
        );
    }
  };
  return (
    <div className="flex max-w-xs flex-col gap-4 overflow-hidden rounded-xl bg-white/10 p-4 text-white">
      <h3 className="text-lg font-bold">Add your own referral link.</h3>
      <div className="text-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleClick();
          }}
          className="flex flex-col items-center gap-4"
        >
          <input
            value={referralLink}
            onChange={(e) => setReferralLink(e.target.value)}
            type="text"
            placeholder="Referral Link"
            className="rounded-md px-2 py-1 text-slate-700"
          />
          <button className="w-1/2 rounded-md border border-white px-2 py-1 text-sm hover:bg-white/20">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

const Card = ({
  title,
  referralLink,
  referralLinkId,
  referralLinkCanBeReused,
}: {
  title: string;
  referralLink: string;
  referralLinkId: string;
  referralLinkCanBeReused: boolean;
}) => {
  const mutateUsedLink = trpc.example.setReferralLinkUsed.useMutation();

  const handleLinkNotWorkingClick = () => {
    mutateUsedLink
      .mutateAsync({ id: referralLinkId })
      .then((res) =>
        toast.success(
          `Succesfully marked referral link as invalid or used. Please refresh the page to get a new link`
        )
      )
      .catch((err) =>
        toast.error(`Error marking referral link as invalid or used`)
      );
  };

  return (
    <div className="flex max-w-xs flex-col gap-4 overflow-hidden rounded-xl bg-white/10 p-4 text-white">
      <h3 className="text-2xl font-bold">{title} →</h3>
      <div className="text-lg">
        {referralLink}{" "}
        <span
          className="rounded-md p-1 hover:cursor-pointer hover:bg-white/20"
          onClick={() => navigator.clipboard.writeText(referralLink)}
        >
          🖨️
        </span>
        {!referralLinkCanBeReused && (
          <div className="mt-5 flex items-center justify-center">
            <button
              onClick={handleLinkNotWorkingClick}
              className="w-1/2 rounded-md border border-white px-2 py-1 text-sm hover:bg-white/20"
            >
              The link is already used
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralPage;

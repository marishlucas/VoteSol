import * as anchor from "@coral-xyz/anchor";
import { clusterApiUrl, PublicKey, Transaction } from "@solana/web3.js";
import idl from "./crowdfunding.json";
import { Crowdfunding } from "./crowdfunding";
import { cache } from "react";
import { WalletContextState } from "@solana/wallet-adapter-react";

export const getProgram = (wallet: anchor.Wallet) => {
  // Connect to local cluster
  const connection = new anchor.web3.Connection(
    clusterApiUrl("devnet"),
    "confirmed",
  );
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
    commitment: "confirmed",
  });

  // Initialize the program with IDL and provider
  return new anchor.Program(idl as Crowdfunding, provider);
};

export const createProject = async (
  wallet: anchor.Wallet,
  title: string,
  description: string,
  target: number,
) => {
  const program = getProgram(wallet);
  const [projectPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("project"), Buffer.from(title), wallet.publicKey.toBuffer()],
    program.programId,
  );
  try {
    const tx = await program.methods
      .createProject(
        title,
        description,
        new anchor.BN(target * anchor.web3.LAMPORTS_PER_SOL),
      )
      .accounts({
        //@ts-ignore
        project: projectPDA,
      })
      .rpc();
    console.log("Project created successfully. Transaction signature:", tx);

    // Invalidate the projects cache
    if (typeof window !== "undefined") {
      await fetch("/api/revalidate?tag=projects");
    }

    return tx;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

export const getProjectData = async (
  wallet: anchor.Wallet,
  projectTitle: string,
) => {
  const program = getProgram(wallet);
  const [projectPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("project"),
      Buffer.from(projectTitle),
      wallet.publicKey.toBuffer(),
    ],
    program.programId,
  );

  try {
    const projectAccount = await program.account.project.fetch(projectPDA);
    console.log("Project data:", projectAccount);
    return projectAccount;
  } catch (error) {
    console.error("Error fetching project data:", error);
    throw error;
  }
};

export const getProjects = cache(async (wallet: anchor.Wallet) => {
  const program = getProgram(wallet);
  try {
    const allProjects = await program.account.project.all();
    const userProjects = allProjects.filter((project) =>
      project.account.creator.equals(wallet.publicKey),
    );
    const otherProjects = allProjects.filter(
      (project) => !project.account.creator.equals(wallet.publicKey),
    );
    return { userProjects, otherProjects };
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
});

export async function investInProject(
  wallet: WalletContextState,
  projectPubkey: PublicKey,
  projectName: string,
  amount: number,
) {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected");
  }

  const connection = new anchor.web3.Connection(
    clusterApiUrl("devnet"),
    "confirmed",
  );

  //@ts-ignore
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
    commitment: "confirmed",
  });
  const program = new anchor.Program(idl as Crowdfunding, provider);

  try {
    // Fetch the project account to get the creator's public key
    const projectAccount = await program.account.project.fetch(projectPubkey);
    const projectCreator = projectAccount.creator;

    const [projectPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("project"),
        Buffer.from(projectName),
        projectCreator.toBuffer(),
      ],
      program.programId,
    );

    console.log("Investing in project with PDA:", projectPDA.toBase58());

    const tx = await program.methods
      .invest(new anchor.BN(amount))
      .accounts({
        //@ts-ignore
        project: projectPDA,
      })
      .transaction();

    const signature = await wallet.sendTransaction(tx, connection);
    await connection.confirmTransaction(signature, "confirmed");

    console.log("Investment transaction confirmed:", signature);
    return signature;
  } catch (error) {
    console.error("Detailed error in investInProject:", error);
    throw error;
  }
}

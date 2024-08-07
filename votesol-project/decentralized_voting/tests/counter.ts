import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { DecentralizedVoting } from "../target/types/decentralized_voting";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import { expect } from "chai";

describe("decentralized_voting", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.DecentralizedVoting as Program<DecentralizedVoting>;

  let projectAccount: Keypair;
  let project: Keypair;

  before(async () => {
    projectAccount = Keypair.generate();
    project = Keypair.generate();
  });

  it("Initializes the project account", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        projectAccount: projectAccount.publicKey,
        authority: provider.wallet.publicKey,
      })
      .signers([projectAccount])
      .rpc();

    const account = await program.account.projectAccount.fetch(projectAccount.publicKey);
    expect(account.authority.toBase58()).to.equal(provider.wallet.publicKey.toBase58());
    expect(account.totalVotes.toNumber()).to.equal(0);
    expect(account.totalInvestment.toNumber()).to.equal(0);
  });

  it("Creates a new project", async () => {
    const name = "Test Project";
    const description = "This is a test project";
    const targetAmount = new anchor.BN(1_000_000_000); // 1 SOL (lamports)

    const tx = await program.methods
      .createProject(name, description, targetAmount)
      .accounts({
        project: project.publicKey,
        authority: provider.wallet.publicKey,
      })
      .signers([project])
      .rpc();

    const projectData = await program.account.project.fetch(project.publicKey);
    expect(projectData.name).to.equal(name);
    expect(projectData.description).to.equal(description);
    expect(projectData.targetAmount.toNumber()).to.equal(targetAmount.toNumber());
    expect(projectData.currentAmount.toNumber()).to.equal(0);
    expect(projectData.votes.toNumber()).to.equal(0);
  });

  it("Votes for a project", async () => {
    const tx = await program.methods
      .vote()
      .accounts({
        project: project.publicKey,
        projectAccount: projectAccount.publicKey,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const projectData = await program.account.project.fetch(project.publicKey);
    const accountData = await program.account.projectAccount.fetch(projectAccount.publicKey);
    expect(projectData.votes.toNumber()).to.equal(1);
    expect(accountData.totalVotes.toNumber()).to.equal(1);
  });

  it("Invests in a project", async () => {
    const investmentAmount = new anchor.BN(500_000_000); // 0.5 SOL (lamports)

    const tx = await program.methods
      .invest(investmentAmount)
      .accounts({
        project: project.publicKey,
        projectAccount: projectAccount.publicKey,
        investor: provider.wallet.publicKey,
      })
      .rpc();

    const projectData = await program.account.project.fetch(project.publicKey);
    const accountData = await program.account.projectAccount.fetch(projectAccount.publicKey);
    expect(projectData.currentAmount.toNumber()).to.equal(investmentAmount.toNumber());
    expect(accountData.totalInvestment.toNumber()).to.equal(investmentAmount.toNumber());
  });
});

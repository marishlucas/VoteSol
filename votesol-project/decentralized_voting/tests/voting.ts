import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Crowdfunding } from "../target/types/crowdfunding";
import { expect } from "chai";

describe("crowdfunding", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Crowdfunding as Program<Crowdfunding>;

  it("Initializes the program state", async () => {
    const stateSeed = anchor.web3.Keypair.generate();

    await program.methods
      .initialize()
      .accounts({
        state: stateSeed.publicKey,
        user: provider.wallet.publicKey,
      })
      .signers([stateSeed])
      .rpc();

    const stateAccount = await program.account.state.fetch(stateSeed.publicKey);
    expect(stateAccount.projectCount.toNumber()).to.equal(0);
  });

  it("Creates a project", async () => {
    const projectName = `Test Project ${Date.now()}`;
    const [projectPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("project"), Buffer.from(projectName), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .createProject(projectName, "A test project description", new anchor.BN(1000))
      .accounts({
        //@ts-ignore
        project: projectPDA,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const projectAccount = await program.account.project.fetch(projectPDA);
    expect(projectAccount.title).to.equal(projectName);
    expect(projectAccount.description).to.equal("A test project description");
    expect(projectAccount.target.toNumber()).to.equal(1000);
    expect(projectAccount.amountCollected.toNumber()).to.equal(0);
    expect(projectAccount.investorCount.toNumber()).to.equal(0);
    expect(projectAccount.investors).to.be.empty;
  });

  it("Creates a project and invests in it", async () => {
    const projectName = `Investing Project ${Date.now()}`;
    const [projectPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("project"), Buffer.from(projectName), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .createProject(projectName, "A project to test investments", new anchor.BN(1000))
      .accounts({
        //@ts-ignore
        project: projectPDA,
        user: provider.wallet.publicKey,
      })
      .rpc();

    let projectAccount = await program.account.project.fetch(projectPDA);
    expect(projectAccount.title).to.equal(projectName);
    expect(projectAccount.amountCollected.toNumber()).to.equal(0);
    expect(projectAccount.investorCount.toNumber()).to.equal(0);
    expect(projectAccount.investors).to.be.empty;

    const investmentAmount = new anchor.BN(500);
    await program.methods
      .invest(investmentAmount)
      .accounts({
        //@ts-ignore
        project: projectPDA,
        user: provider.wallet.publicKey,
      })
      .rpc();

    projectAccount = await program.account.project.fetch(projectPDA);
    expect(projectAccount.amountCollected.toNumber()).to.equal(500);
    expect(projectAccount.investorCount.toNumber()).to.equal(1);
    expect(projectAccount.investors).to.have.lengthOf(1);
    expect(projectAccount.investors[0].toString()).to.equal(provider.wallet.publicKey.toString());

    await program.methods
      .invest(investmentAmount)
      .accounts({
        //@ts-ignore
        project: projectPDA,
        user: provider.wallet.publicKey,
      })
      .rpc();

    projectAccount = await program.account.project.fetch(projectPDA);
    expect(projectAccount.amountCollected.toNumber()).to.equal(1000);
    expect(projectAccount.investorCount.toNumber()).to.equal(1);
    expect(projectAccount.investors).to.have.lengthOf(1);
    expect(projectAccount.investors[0].toString()).to.equal(provider.wallet.publicKey.toString());
  });
});

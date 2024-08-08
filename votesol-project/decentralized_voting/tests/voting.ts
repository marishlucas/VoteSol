import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Crowdfunding } from "../target/types/crowdfunding";
import { expect } from "chai";

describe("crowdfunding", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Crowdfunding as Program<Crowdfunding>;

  it("Initializes the program state", async () => {
    const state = anchor.web3.Keypair.generate();

    await program.methods
      .initialize()
      .accounts({
        state: state.publicKey,
        user: provider.wallet.publicKey,
      })
      .signers([state])
      .rpc();

    const stateAccount = await program.account.state.fetch(state.publicKey);
    expect(stateAccount.projectCount.toNumber()).to.equal(0);
  });

  it("Creates a project", async () => {
    const state = anchor.web3.Keypair.generate();
    const project = anchor.web3.Keypair.generate();

    // First, initialize the state
    await program.methods
      .initialize()
      .accounts({
        state: state.publicKey,
        user: provider.wallet.publicKey,
      })
      .signers([state])
      .rpc();

    // Then, create a project
    await program.methods
      .createProject("Test Project", "A test project description", new anchor.BN(1000))
      .accounts({
        project: project.publicKey,
        state: state.publicKey,
        user: provider.wallet.publicKey,
      })
      .signers([project])
      .rpc();

    const projectAccount = await program.account.project.fetch(project.publicKey);
    expect(projectAccount.title).to.equal("Test Project");
    expect(projectAccount.description).to.equal("A test project description");
    expect(projectAccount.target.toNumber()).to.equal(1000);
    expect(projectAccount.amountCollected.toNumber()).to.equal(0);
    expect(projectAccount.investorCount.toNumber()).to.equal(0);

    const stateAccount = await program.account.state.fetch(state.publicKey);
    expect(stateAccount.projectCount.toNumber()).to.equal(1);
  });
});

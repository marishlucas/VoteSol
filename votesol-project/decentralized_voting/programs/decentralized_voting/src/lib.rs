use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;

declare_id!("HefrVwo4RQNfRmP8CWrC81kPFwTZhd4Lou2tkST2dz8A");

#[program]
pub mod crowdfunding {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.project_count = 0;
        Ok(())
    }

    pub fn create_project(
        ctx: Context<CreateProject>,
        title: String,
        description: String,
        target: u64,
    ) -> Result<()> {
        let project = &mut ctx.accounts.project;
        let state = &mut ctx.accounts.state;

        project.title = title;
        project.description = description;
        project.target = target;
        project.amount_collected = 0;
        project.investor_count = 0;
        project.creator = ctx.accounts.user.key();
        project.created_at = Clock::get()?.unix_timestamp;

        state.project_count += 1;

        Ok(())
    }

    pub fn invest(ctx: Context<Invest>, amount: u64) -> Result<()> {
        let project = &mut ctx.accounts.project;
        let investor = &mut ctx.accounts.investor;

        project.amount_collected += amount;
        project.investor_count += 1;
        investor.amount = amount;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 8)]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateProject<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 256 + 256 + 8 + 8 + 8 + 32 + 8
    )]
    pub project: Account<'info, Project>,
    #[account(mut)]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Invest<'info> {
    #[account(mut)]
    pub project: Account<'info, Project>,
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 8,
        seeds = [b"investor", project.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub investor: Account<'info, Investor>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct State {
    pub project_count: u64,
}

#[account]
pub struct Project {
    pub title: String,
    pub description: String,
    pub target: u64,
    pub amount_collected: u64,
    pub investor_count: u64,
    pub creator: Pubkey,
    pub created_at: i64,
}

#[account]
pub struct Investor {
    pub user: Pubkey,
    pub amount: u64,
}

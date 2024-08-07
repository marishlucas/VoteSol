use anchor_lang::prelude::*;

declare_id!("HefrVwo4RQNfRmP8CWrC81kPFwTZhd4Lou2tkST2dz8A");

#[program]
pub mod decentralized_voting {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let project_account = &mut ctx.accounts.project_account;
        project_account.authority = *ctx.accounts.authority.key;
        project_account.total_votes = 0;
        project_account.total_investment = 0;
        Ok(())
    }

    pub fn create_project(
        ctx: Context<CreateProject>,
        name: String,
        description: String,
        target_amount: u64,
    ) -> Result<()> {
        let project = &mut ctx.accounts.project;
        project.name = name;
        project.description = description;
        project.target_amount = target_amount;
        project.current_amount = 0;
        project.votes = 0;
        project.authority = *ctx.accounts.authority.key;
        Ok(())
    }

    pub fn vote(ctx: Context<Vote>) -> Result<()> {
        let project = &mut ctx.accounts.project;
        let project_account = &mut ctx.accounts.project_account;

        project.votes += 1;
        project_account.total_votes += 1;
        Ok(())
    }

    pub fn invest(ctx: Context<Invest>, amount: u64) -> Result<()> {
        let project = &mut ctx.accounts.project;
        let project_account = &mut ctx.accounts.project_account;

        project.current_amount += amount;
        project_account.total_investment += amount;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 8 + 8)]
    pub project_account: Account<'info, ProjectAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateProject<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 50 + 200 + 8 + 8 + 8 + 32)]
    pub project: Account<'info, Project>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub project: Account<'info, Project>,
    #[account(mut)]
    pub project_account: Account<'info, ProjectAccount>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct Invest<'info> {
    #[account(mut)]
    pub project: Account<'info, Project>,
    #[account(mut)]
    pub project_account: Account<'info, ProjectAccount>,
    #[account(mut)]
    pub investor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct ProjectAccount {
    pub authority: Pubkey,
    pub total_votes: u64,
    pub total_investment: u64,
}

#[account]
pub struct Project {
    pub name: String,
    pub description: String,
    pub target_amount: u64,
    pub current_amount: u64,
    pub votes: u64,
    pub authority: Pubkey,
}


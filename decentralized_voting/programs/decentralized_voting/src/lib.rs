use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;
use anchor_lang::solana_program::program::invoke_signed;

declare_id!("J78FH4DCfxvVaCJLaFvZaPoYf3V38RXbwWvNXP2zEdGm");

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

        project.title = title;
        project.description = description;
        project.target = target;
        project.amount_collected = 0;
        project.investor_count = 0;
        project.creator = ctx.accounts.user.key();
        project.created_at = Clock::get()?.unix_timestamp;

        Ok(())
    }

    pub fn invest(ctx: Context<Invest>, amount: u64) -> Result<()> {
        let project = &mut ctx.accounts.project;
        let investor = &ctx.accounts.user;

        // Calculate the bump seed
        let (_, bump) = Pubkey::find_program_address(
            &[
                b"project",
                project.title.as_bytes(),
                project.creator.as_ref(),
            ],
            ctx.program_id,
        );

        // Create the transfer instruction
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            investor.key,
            &project.key(),
            amount,
        );

        // Invoke the transfer instruction with a signature for the PDA
        invoke_signed(
            &ix,
            &[
                investor.to_account_info(),
                project.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[&[
                b"project",
                project.title.as_bytes(),
                project.creator.as_ref(),
                &[bump],
            ]],
        )?;

        // Update project state
        if !project.investors.contains(investor.key) {
            project.investor_count += 1;
            project.investors.push(*investor.key);
        }
        project.amount_collected += amount;

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

// #[derive(Accounts)]
// pub struct CreateProject<'info> {
//     #[account(
//         init,
//         payer = user,
//         space = 8 + 32 + 256 + 256 + 8 + 8 + 8 + 32 + 8
//     )]
//     pub project: Account<'info, Project>,
//     #[account(mut)]
//     pub state: Account<'info, State>,
//     #[account(mut)]
//     pub user: Signer<'info>,
//     pub system_program: Program<'info, System>,
// }

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateProject<'info> {
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 256 + 256 + 8 + 8 + 32,
        seeds = [b"project", name.as_bytes(), user.key().as_ref()],
        bump
    )]
    pub project: Account<'info, Project>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// #[derive(Accounts)]
// pub struct Invest<'info> {
//     #[account(mut)]
//     pub project: Account<'info, Project>,
//     #[account(mut)]
//     pub user: Signer<'info>,
//     pub system_program: Program<'info, System>,
// }

#[derive(Accounts)]
pub struct Invest<'info> {
    #[account(
        mut,
        seeds = [b"project", project.title.as_bytes(), project.creator.key().as_ref()],
        bump
    )]
    pub project: Account<'info, Project>,
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
    pub investors: Vec<Pubkey>,
}

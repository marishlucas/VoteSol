#![allow(clippy::result_large_err)]
use anchor_lang::prelude::*;

declare_id!("HefrVwo4RQNfRmP8CWrC81kPFwTZhd4Lou2tkST2dz8A");

#[program]
pub mod decentralized_voting {
    use super::*;

    pub fn close(_ctx: Context<CloseCounter>) -> Result<()> {
        Ok(())
    }

    pub fn decrement(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.counter.count = ctx
            .accounts
            .counter
            .count
            .checked_sub(1)
            .ok_or(ProgramError::Underflow)?;
        Ok(())
    }

    pub fn increment(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.counter.count = ctx
            .accounts
            .counter
            .count
            .checked_add(1)
            .ok_or(ProgramError::Overflow)?;
        Ok(())
    }

    pub fn initialize(ctx: Context<InitializeCounter>) -> Result<()> {
        ctx.accounts.counter.count = 0;
        Ok(())
    }

    pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
        ctx.accounts.counter.count = value;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeCounter<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        space = 8 + Counter::INIT_SPACE,
        payer = payer
    )]
    pub counter: Account<'info, Counter>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseCounter<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        close = payer, // close account and return lamports to payer
    )]
    pub counter: Account<'info, Counter>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,
}

#[account]
#[derive(InitSpace)]
pub struct Counter {
    count: u8,
}

#[error_code]
pub enum ProgramError {
    #[msg("Math operation overflow")]
    Overflow,
    #[msg("Math operation underflow")]
    Underflow,
}


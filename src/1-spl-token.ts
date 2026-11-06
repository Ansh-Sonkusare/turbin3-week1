// Task 1: create an SPL token mint, mint supply to my wallet, transfer some to a second wallet.
import { createMintWithAssociatedToken, createTokenIfMissing, fetchToken, findAssociatedTokenPda, transferTokens } from "@metaplex-foundation/mpl-toolbox";
import { generateSigner, publicKey } from "@metaplex-foundation/umi";
import { explorer, recipient, save, sig, state, umi } from "./common";

const DECIMALS = 6;
const units = (n: number) => BigInt(n) * 10n ** BigInt(DECIMALS);

const to = recipient().publicKey;

// Mint account + my associated token account + initial supply of 1,000,000 tokens, in one tx.
// Skipped on re-runs so a failed transfer can be retried without minting a second token.
if (!state.tokenMint) {
  const mint = generateSigner(umi);
  const created = await createMintWithAssociatedToken(umi, { mint, decimals: DECIMALS, amount: units(1_000_000) }).sendAndConfirm(umi);
  state.tokenMint = mint.publicKey;
  save();
  console.log("mint tx:", explorer(sig(created.signature)));
}
const mint = { publicKey: publicKey(state.tokenMint) };
console.log("mint:", explorer(mint.publicKey, "address"));

// Transfer 1,000 tokens. The recipient's ATA is created first if it doesn't exist (I pay its rent).
const source = findAssociatedTokenPda(umi, { mint: mint.publicKey, owner: umi.identity.publicKey })[0];
const destination = findAssociatedTokenPda(umi, { mint: mint.publicKey, owner: to })[0];
const sent = await createTokenIfMissing(umi, { mint: mint.publicKey, owner: to })
  .add(transferTokens(umi, { source, destination, amount: units(1_000) }))
  .sendAndConfirm(umi);
console.log("transfer tx:", explorer(sig(sent.signature)));

const [mine, theirs] = await Promise.all([fetchToken(umi, source), fetchToken(umi, destination)]);
console.log(`balances: me=${mine.amount / units(1)} recipient=${theirs.amount / units(1)}`);

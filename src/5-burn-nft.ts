// Extension 5: the current owner (second wallet) burns the NFT and the freed rent goes back to the payer.
// Core doesn't close the account: it shrinks it to a 1-byte tombstone so the address can't be reused.
// The tombstone keeps its own 1-byte rent plus the 0.0015 SOL protocol fee charged at create.
import { burn, fetchAsset } from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";
import { explorer, recipient, sig, state, umi } from "./common";

const asset = await fetchAsset(umi, publicKey(state.nft));
const owner = recipient();
const lamports = async () => (await umi.rpc.getBalance(asset.publicKey)).basisPoints;
const assetBefore = await lamports();
const before = (await umi.rpc.getBalance(umi.payer.publicKey)).basisPoints;

// Owner signs as authority; my main wallet stays fee payer and receives the reclaimed rent.
const res = await burn(umi, { asset, authority: owner }).sendAndConfirm(umi);

const after = (await umi.rpc.getBalance(umi.payer.publicKey)).basisPoints;
const acct = await umi.rpc.getAccount(asset.publicKey);
const sol = (n: bigint) => `${Number(n) / 1e9} SOL`;
console.log(`asset account: ${acct.exists ? acct.data.length : 0} byte(s) left (tombstone)`);
console.log(`reclaimed rent: ${sol(assetBefore - (await lamports()))}, payer net change: ${sol(after - before)} (after tx fee)`);
console.log("burn tx:", explorer(sig(res.signature)));

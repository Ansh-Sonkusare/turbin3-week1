import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCore } from "@metaplex-foundation/mpl-core";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { createSignerFromKeypair, generateSigner, keypairIdentity, Signer, Umi } from "@metaplex-foundation/umi";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";

const WALLET = process.env.WALLET ?? `${homedir()}/.config/solana/id.json`;
const RECIPIENT = "wallets/recipient.json";
const STATE = "state.json";

export const REPO_RAW = "https://raw.githubusercontent.com/Ansh-Sonkusare/turbin3-week1/main";

export const umi: Umi = createUmi(process.env.RPC ?? "https://api.devnet.solana.com", "finalized").use(mplCore()).use(mplToolbox());
const kp = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(JSON.parse(readFileSync(WALLET, "utf8"))));
umi.use(keypairIdentity(kp));

// Second wallet used as the receiver for token + NFT transfers. Created once, kept out of git.
export function recipient(): Signer {
  if (!existsSync(RECIPIENT)) writeFileSync(RECIPIENT, JSON.stringify(Array.from(generateSigner(umi).secretKey)));
  return createSignerFromKeypair(umi, umi.eddsa.createKeypairFromSecretKey(new Uint8Array(JSON.parse(readFileSync(RECIPIENT, "utf8")))));
}

// "finalized" is slower, but devnet RPC nodes otherwise sometimes serve reads from before the last confirmed tx.
// Addresses created by earlier steps, so each script can pick up where the last left off.
export const state: Record<string, string> = existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : {};
export const save = () => writeFileSync(STATE, JSON.stringify(state, null, 2) + "\n");

export const sig = (s: Uint8Array) => base58.deserialize(s)[0];
export const explorer = (x: string, kind: "tx" | "address" = "tx") => `https://explorer.solana.com/${kind}/${x}?cluster=devnet`;

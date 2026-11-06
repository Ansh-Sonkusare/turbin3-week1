// Task 2: mint an NFT with Metaplex Core (a single account, no separate mint/metadata/edition accounts).
import { create, fetchAsset } from "@metaplex-foundation/mpl-core";
import { generateSigner } from "@metaplex-foundation/umi";
import { explorer, REPO_RAW, save, sig, state, umi } from "./common";

const asset = generateSigner(umi);
const res = await create(umi, { asset, name: "Turbin3 Builder #1", uri: `${REPO_RAW}/metadata/v1.json` }).sendAndConfirm(umi);
state.nft = asset.publicKey;
save();

const a = await fetchAsset(umi, asset.publicKey);
console.log("asset:", explorer(asset.publicKey, "address"));
console.log("create tx:", explorer(sig(res.signature)));
console.log({ name: a.name, uri: a.uri, owner: a.owner, updateAuthority: a.updateAuthority });
